// Classes Management and Jitsi Integration

let jitsiApi = null;
let currentClassId = null;
let classes = [];

// Load classes from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadClasses();
    renderClasses();
    setupFormListener();
});

// Setup form submission
function setupFormListener() {
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', createClass);
    }
}

// Create a new class
function createClass(e) {
    e.preventDefault();

    const newClass = {
        id: Date.now(),
        name: document.getElementById('className').value,
        instructor: document.getElementById('instructorName').value,
        topic: document.getElementById('topic').value,
        dateTime: document.getElementById('classDateTime').value,
        description: document.getElementById('description').value,
        roomName: `target-y-class-${Date.now()}`
    };

    classes.push(newClass);
    saveClasses();
    renderClasses();

    // Reset form
    document.getElementById('classForm').reset();
    alert(`✅ Class "${newClass.name}" created! Students can now join.`);
}

// Save classes to localStorage
function saveClasses() {
    localStorage.setItem('targetYClasses', JSON.stringify(classes));
}

// Load classes from localStorage
function loadClasses() {
    const saved = localStorage.getItem('targetYClasses');
    classes = saved ? JSON.parse(saved) : [];
}

// Render all classes
function renderClasses() {
    const container = document.getElementById('classesContainer');
    
    if (classes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>No classes available</h4>
                <p>Create a new class above to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = classes.map(cls => {
        const classDate = new Date(cls.dateTime);
        const formattedDate = classDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="class-card">
                <div class="class-card-header">
                    <h4>${cls.name}</h4>
                    <div class="class-card-meta">${formattedDate}</div>
                </div>
                <div class="class-card-body">
                    <p><span class="class-card-label">📚 Topic:</span> ${cls.topic}</p>
                    <p><span class="class-card-label">👨‍🏫 Instructor:</span> ${cls.instructor}</p>
                    <p><span class="class-card-label">📝 Description:</span></p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">${cls.description || 'No description provided'}</p>
                </div>
                <div class="class-card-footer">
                    <button class="join-class-btn" onclick="joinClass(${cls.id})">🎥 Join Class</button>
                    <button class="delete-class-btn" onclick="deleteClass(${cls.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Join a class via Jitsi
function joinClass(classId) {
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) {
        alert('Class not found!');
        return;
    }

    currentClassId = classId;
    
    // Hide classes list, show video section
    document.querySelector('.classes-section').style.display = 'none';
    document.getElementById('videoSection').style.display = 'block';

    // Update class info
    document.getElementById('liveClassName').textContent = `📚 ${classItem.name}`;
    document.getElementById('liveInstructor').textContent = `👨‍🏫 Instructor: ${classItem.instructor}`;

    // Initialize Jitsi Meet
    initJitsi(classItem.roomName);
}

// Initialize Jitsi Meet
function initJitsi(roomName) {
    const domain = 'meet.jitsi.org';
    const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            disableSimulcast: false,
            enableLipSync: true,
            enableNoisyMicDetection: true,
            defaultLanguage: 'en',
            p2p: {
                enabled: true,
                preferredCodec: 'VP9'
            }
        },
        interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: '#0a0f0a',
            TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'chat',
                'recording',
                'livestreaming',
                'etherpad',
                'settings',
                'raisehand',
                'videoquality',
                'filmstrip',
                'invite',
                'feedback',
                'stats',
                'shortcuts',
                'tileview',
                'download',
                'profile',
                'help'
            ],
            SHOW_JITSI_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: false,
            LANG_DETECTION: true,
            SHOW_WATERMARK_FOR_GUESTS: false,
            ENABLE_FEEDBACK_ANIMATION: false,
            VERTICAL_FILMSTRIP: true,
            FILMSTRIP_MAXHEIGHT: 120,
            SETTINGS_SECTIONS: ['language', 'devices', 'language', 'shortcuts', 'recognition'],
            REMOTE_THUMBNAIL_RATIO_COMPUTE: 'remote'
        },
        userInfo: {
            displayName: 'Target Y Student'
        }
    };

    // Create Jitsi API instance
    jitsiApi = new JitsiMeetExternalAPI(domain, options);

    // Handle events
    jitsiApi.addEventListener('participantJoined', onParticipantJoined);
    jitsiApi.addEventListener('participantLeft', onParticipantLeft);
    jitsiApi.addEventListener('videoConferenceLeft', onVideoConferenceLeft);
    jitsiApi.addEventListener('readyToClose', onReadyToClose);

    console.log('✅ Jitsi Meet initialized. Room:', roomName);
}

// Jitsi Event Handlers
function onParticipantJoined(participant) {
    console.log('🎥 Participant joined:', participant);
}

function onParticipantLeft(participant) {
    console.log('👋 Participant left:', participant);
}

function onVideoConferenceLeft() {
    console.log('Video conference left');
}

function onReadyToClose() {
    leaveClass();
}

// Leave the class
function leaveClass() {
    if (jitsiApi) {
        jitsiApi.dispose();
        jitsiApi = null;
    }

    // Clear video container
    document.getElementById('jitsi-container').innerHTML = '';

    // Show classes list, hide video section
    document.getElementById('videoSection').style.display = 'none';
    document.querySelector('.classes-section').style.display = 'block';

    currentClassId = null;
}

// Delete a class
function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class?')) {
        classes = classes.filter(c => c.id !== classId);
        saveClasses();
        renderClasses();
        alert('✅ Class deleted successfully!');
    }
}

// Export classes data (for admin/analytics)
function exportClassesData() {
    const dataStr = JSON.stringify(classes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'target-y-classes.json';
    link.click();
}

console.log('🚀 Target Y Classes System Loaded - Ready for live sessions!');
