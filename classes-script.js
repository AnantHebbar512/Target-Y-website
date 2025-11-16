// Classes Management and Jitsi Integration

let jitsiApi = null;
let currentClassId = null;
let classes = [];

// Load classes from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Classes page loaded');
    loadClasses();
    renderClasses();
    setupFormListener();
});

// Setup form submission
function setupFormListener() {
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', createClass);
        console.log('Form listener setup complete');
    }
}

// Create a new class
function createClass(e) {
    e.preventDefault();
    
    const name = document.getElementById('className').value;
    const instructor = document.getElementById('instructorName').value;
    const topic = document.getElementById('topic').value;
    const dateTime = document.getElementById('classDateTime').value;
    const description = document.getElementById('description').value;

    if (!name || !instructor || !topic || !dateTime) {
        alert('Please fill all required fields!');
        return;
    }

    const newClass = {
        id: Date.now(),
        name: name,
        instructor: instructor,
        topic: topic,
        dateTime: dateTime,
        description: description,
        roomName: 'target-y-class-' + Date.now()
    };

    classes.push(newClass);
    saveClasses();
    renderClasses();
    document.getElementById('classForm').reset();
    
    console.log('Class created:', newClass);
    alert(`✅ Class "${newClass.name}" created successfully! Share the link to invite students.`);
}

// Save classes to localStorage
function saveClasses() {
    localStorage.setItem('targetYClasses', JSON.stringify(classes));
}

// Load classes from localStorage
function loadClasses() {
    const saved = localStorage.getItem('targetYClasses');
    classes = saved ? JSON.parse(saved) : [];
    console.log('Loaded classes:', classes);
}

// Render all classes
function renderClasses() {
    const container = document.getElementById('classesContainer');
    
    if (!container) {
        console.error('Classes container not found!');
        return;
    }
    
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
                    <button class="share-class-btn" onclick="getShareLink(${cls.id})">📤 Share</button>
                    <button class="delete-class-btn" onclick="deleteClass(${cls.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Get share link for a class
function getShareLink(classId) {
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) {
        alert('Class not found!');
        return;
    }

    const shareUrl = window.location.origin + window.location.pathname + '?joinClass=' + classId;
    document.getElementById('shareLink').value = shareUrl;
    document.getElementById('shareLinkContainer').style.display = 'block';
    
    console.log('Share link:', shareUrl);
}

// Copy share link to clipboard
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    alert('✅ Link copied to clipboard!');
}

// Share to WhatsApp
function shareToWhatsApp() {
    const shareLink = document.getElementById('shareLink').value;
    const message = encodeURIComponent(`🎓 Join our Target Y Live Class!\n\n${shareLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
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
    document.getElementById('classesManagementSection').style.display = 'none';
    document.getElementById('videoSection').style.display = 'block';
    document.getElementById('shareLinkContainer').style.display = 'none';

    // Update class info
    document.getElementById('liveClassName').textContent = `📚 ${classItem.name} - ${classItem.topic}`;

    // Initialize Jitsi Meet
    initJitsi(classItem.roomName);
    
    console.log('Joining class:', classItem);
}

// Initialize Jitsi Meet
function initJitsi(roomName) {
    const domain = 'meet.jitsi.org';
    
    // Clear container first
    const container = document.getElementById('jitsi-container');
    container.innerHTML = '';
    
    console.log('Initializing Jitsi with room:', roomName);

    const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableSimulcast: false,
            enableLipSync: true,
            p2p: {
                enabled: true,
                preferredCodec: 'VP9'
            },
            constraints: {
                video: {
                    height: {
                        ideal: 720,
                        max: 720,
                        min: 180
                    }
                },
                audio: true
            }
        },
        interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: '#0a0f0a',
            DISABLE_VIDEO_BACKGROUND: false,
            TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'hangup',
                'chat',
                'raisehand',
                'videoquality',
                'filmstrip',
                'invite',
                'help'
            ],
            SHOW_JITSI_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            VERTICAL_FILMSTRIP: false,
            SHOW_POWERED_BY: false
        },
        userInfo: {
            displayName: 'Target Y Student'
        }
    };

    try {
        // Create Jitsi API instance
        if (typeof JitsiMeetExternalAPI !== 'undefined') {
            jitsiApi = new JitsiMeetExternalAPI(domain, options);

            // Handle events
            jitsiApi.addEventListener('participantJoined', onParticipantJoined);
            jitsiApi.addEventListener('participantLeft', onParticipantLeft);
            jitsiApi.addEventListener('videoConferenceLeft', onVideoConferenceLeft);
            jitsiApi.addEventListener('readyToClose', onReadyToClose);

            console.log('✅ Jitsi Meet initialized successfully');
        } else {
            console.error('JitsiMeetExternalAPI not loaded');
            alert('Error loading video conference. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error initializing Jitsi:', error);
        alert('Error initializing video conference: ' + error.message);
    }
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
    console.log('Ready to close');
    leaveClass();
}

// Leave the class
function leaveClass() {
    console.log('Leaving class...');
    
    if (jitsiApi) {
        jitsiApi.dispose();
        jitsiApi = null;
    }

    // Clear video container
    const container = document.getElementById('jitsi-container');
    if (container) {
        container.innerHTML = '';
    }

    // Show classes list, hide video section
    document.getElementById('videoSection').style.display = 'none';
    document.getElementById('classesManagementSection').style.display = 'block';

    currentClassId = null;
    console.log('✅ Left class successfully');
}

// Delete a class
function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class?')) {
        classes = classes.filter(c => c.id !== classId);
        saveClasses();
        renderClasses();
        alert('✅ Class deleted successfully!');
        console.log('Class deleted:', classId);
    }
}

// Check if joining from shared link
window.addEventListener('load', function() {
    const params = new URLSearchParams(window.location.search);
    const joinClassId = params.get('joinClass');
    
    if (joinClassId) {
        setTimeout(function() {
            const classItem = classes.find(c => c.id == joinClassId);
            if (classItem) {
                joinClass(classItem.id);
            } else {
                alert('Class not found. It may have been deleted.');
            }
        }, 500);
    }
});

console.log('🚀 Target Y Classes System Loaded - Ready for live sessions!');

