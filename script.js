/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentScreen = 1;

let soundEnabled = true;

let enteredDOB = "";

let currentMemory = 0;

let letterOpened = false;

let typingTimer = null;


/* =====================================================
   MUSIC VOLUME
===================================================== */

const MAIN_MUSIC_VOLUME = 0.13;

const MEMORY_MUSIC_VOLUME = 0.20;


/* =====================================================
   AUDIO
===================================================== */

const bgMusic =
    document.getElementById("bgMusic");

const memoryMusic =
    document.getElementById("memoryMusic");

let audioCtx = null;


/* =====================================================
   AUDIO CONTEXT
===================================================== */

function getAudioContext() {

    if (!audioCtx) {

        audioCtx =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (
        audioCtx.state === "suspended"
    ) {

        audioCtx.resume();

    }

    return audioCtx;
}


/* =====================================================
   BASIC SOUND
===================================================== */

function playTone(
    freq,
    type = "sine",
    duration = 0.15,
    volume = 0.13
) {

    if (!soundEnabled) return;

    const ctx =
        getAudioContext();

    const osc =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    osc.type = type;

    osc.frequency.setValueAtTime(
        freq,
        ctx.currentTime
    );


    gain.gain.setValueAtTime(
        volume,
        ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
    );


    osc.connect(gain);

    gain.connect(
        ctx.destination
    );


    osc.start();

    osc.stop(
        ctx.currentTime + duration
    );
}


function playTapSound() {

    playTone(
        520,
        "sine",
        0.08
    );

}


function playBounceSound() {

    playTone(
        280,
        "triangle",
        0.22
    );

}


function playBlowSound() {

    playTone(
        180,
        "sine",
        0.4
    );

}


/* =====================================================
   PARTY SOUND
===================================================== */

function playPartySound() {

    if (!soundEnabled) return;

    const ctx =
        getAudioContext();

    const now =
        ctx.currentTime;


    const boom =
        ctx.createOscillator();

    const boomGain =
        ctx.createGain();


    boom.type = "sine";

    boom.frequency.setValueAtTime(
        130,
        now
    );

    boom.frequency.exponentialRampToValueAtTime(
        45,
        now + 0.65
    );


    boomGain.gain.setValueAtTime(
        0.22,
        now
    );

    boomGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.65
    );


    boom.connect(
        boomGain
    );

    boomGain.connect(
        ctx.destination
    );


    boom.start(now);

    boom.stop(
        now + 0.65
    );


    const notes = [
        523.25,
        659.25,
        783.99,
        1046.50
    ];


    notes.forEach(
        (freq, index) => {

            setTimeout(
                () => {

                    playTone(
                        freq,
                        "triangle",
                        0.18,
                        0.12
                    );

                },
                index * 90
            );

        }
    );

}


/* =====================================================
   AUDIO FADE
===================================================== */

function fadeAudio(
    audio,
    target,
    duration = 900
) {

    if (!audio) return;


    const start =
        audio.volume;

    const difference =
        target - start;

    const startTime =
        performance.now();


    function step(now) {

        const progress =
            Math.min(
                (now - startTime) /
                duration,
                1
            );


        audio.volume =
            start +
            difference * progress;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                step
            );

        }

    }


    requestAnimationFrame(
        step
    );
}


/* =====================================================
   MAIN MUSIC
===================================================== */

function startMainMusic() {

    if (
        !bgMusic ||
        !soundEnabled
    ) {
        return;
    }


    bgMusic.volume = 0;

    bgMusic
        .play()
        .catch(() => {});


    fadeAudio(
        bgMusic,
        MAIN_MUSIC_VOLUME,
        900
    );

}


/* =====================================================
   MEMORY MUSIC
===================================================== */

function startMemoryMusic() {
    if (!memoryMusic || !soundEnabled) return;
    
    // Main music stop
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.volume = 0;
    }
    
    memoryMusic.volume = 0;
    
    const playMemory = () => {
        const promise = memoryMusic.play();
        
        if (promise !== undefined) {
            promise
                .then(() => {
                    fadeAudio(
                        memoryMusic,
                        MEMORY_MUSIC_VOLUME,
                        900
                    );
                })
                .catch(() => {
                    // Browser blocked autoplay.
                    // It will retry on the next user interaction.
                });
        }
    };
    
    playMemory();
}
/* =====================================================
   STOP MEMORY MUSIC
===================================================== */

function stopMemoryMusic() {

    if (!memoryMusic) {
        return;
    }


    fadeAudio(
        memoryMusic,
        0,
        700
    );


    setTimeout(
        () => {

            memoryMusic.pause();

            memoryMusic.currentTime = 0;


            if (
                currentScreen !== 8 &&
                soundEnabled
            ) {

                startMainMusic();

            }

        },
        750
    );

}


/* =====================================================
   SOUND TOGGLE
===================================================== */

function toggleSound() {

    soundEnabled =
        !soundEnabled;


    const toggle =
        document.getElementById(
            "soundToggle"
        );


    if (toggle) {

        toggle.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }


    if (!soundEnabled) {

        if (bgMusic) {
            bgMusic.pause();
        }

        if (memoryMusic) {
            memoryMusic.pause();
        }

        return;
    }


    if (
        currentScreen === 8
    ) {

        startMemoryMusic();

    } else {

        startMainMusic();

    }

}


/* =====================================================
   SCREEN NAVIGATION
===================================================== */

function nextScreen(number) {

    if (
        number < 1 ||
        number > 9
    ) {
        return;
    }


    document
        .querySelectorAll(".screen")
        .forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

            }
        );


    const screen =
        document.getElementById(
            "screen" + number
        );


    if (!screen) {
        return;
    }


    screen.classList.add(
        "active"
    );


    currentScreen =
        number;


    if (number === 8) {

        updateMemory();

        startMemoryMusic();

    }

    else if (
        number !== 7
    ) {

        stopMemoryMusic();

    }


    if (number === 7) {

        loadCakeScreen();

    }


    if (number === 9) {

        resetLetterIfNeeded();

    }

}


/* =====================================================
   START
===================================================== */

function beginSurprise() {

    playTapSound();

    startMainMusic();

    nextScreen(2);

}


/* =====================================================
   GO TO DOB
===================================================== */

function goToDOB() {

    playTapSound();

    nextScreen(3);

}


/* =====================================================
   DOB KEYPAD
===================================================== */

function pressKey(number) {

    if (
        enteredDOB.length >= 4
    ) {
        return;
    }


    enteredDOB += number;


    updateDOBDisplay();


    playTapSound();

}


/* =====================================================
   DELETE DOB
===================================================== */

function deleteKey() {

    enteredDOB =
        enteredDOB.slice(
            0,
            -1
        );


    updateDOBDisplay();


    playTapSound();

}


/* =====================================================
   UPDATE DOB DISPLAY
===================================================== */

function updateDOBDisplay() {

    document
        .querySelectorAll(
            "#dobDisplay span"
        )
        .forEach(
            (box, index) => {

                box.textContent =
                    enteredDOB[index] ||
                    "_";

            }
        );

}


/* =====================================================
   SUBMIT DOB
===================================================== */

function submitDOB() {

    if (
        enteredDOB.length !== 4
    ) {

        wrongDOB();

        return;

    }


    /* CHANGE THIS TO THE ACTUAL DDMM */

    const correctDOB =
        "0910";


    if (
        enteredDOB === correctDOB
    ) {

        playTapSound();

        nextScreen(4);

    }

    else {

        enteredDOB = "";

        updateDOBDisplay();

        wrongDOB();

    }

}


/* =====================================================
   WRONG DOB
===================================================== */

function wrongDOB() {

    playTone(
        120,
        "sawtooth",
        0.18,
        0.12
    );


    const display =
        document.getElementById(
            "dobDisplay"
        );


    if (display) {

        display.classList.remove(
            "wrong-dob"
        );


        void display.offsetWidth;


        display.classList.add(
            "wrong-dob"
        );

    }

}


/* =====================================================
   BIRTHDAY PARTY
===================================================== */

function startBirthdayParty() {
    
    playPartySound();
    
    const blast = document.createElement("div");
    blast.className = "party-blast";
    document.body.appendChild(blast);
    
    setTimeout(() => {
        blast.remove();
    }, 900);
    
    try {
        if (typeof confetti === "function") {
            
            confetti({
                particleCount: 160,
                spread: 100,
                startVelocity: 45,
                scalar: 1.1,
                origin: {
                    x: 0.5,
                    y: 0.55
                }
            });
            
            setTimeout(() => {
                
                confetti({
                    particleCount: 90,
                    spread: 120,
                    startVelocity: 30,
                    origin: {
                        x: 0.15,
                        y: 0.6
                    }
                });
                
                confetti({
                    particleCount: 90,
                    spread: 120,
                    startVelocity: 30,
                    origin: {
                        x: 0.85,
                        y: 0.6
                    }
                });
                
            }, 250);
        }
    } catch (e) {}
    
    // Cake page par automatically mat jao.
}

/* =====================================================
   CAKE SCREEN
===================================================== */

function loadCakeScreen() {

    const bottom =
        document.querySelector(
            ".bottomCake"
        );

    const middle =
        document.querySelector(
            ".middleCake"
        );

    const top =
        document.querySelector(
            ".topCake"
        );

    const candles =
        document.querySelector(
            ".candles-wrapper"
        );

    const blowButton =
        document.getElementById(
            "blowBtn"
        );

    const nextButton =
        document.getElementById(
            "cakeNextBtn"
        );


    if (
        !bottom ||
        !middle ||
        !top ||
        !candles
    ) {
        return;
    }


    bottom.classList.remove(
        "animate-base"
    );

    middle.classList.remove(
        "animate-mid"
    );

    top.classList.remove(
        "animate-top"
    );

    candles.classList.remove(
        "animate-candles"
    );

    candles.classList.remove(
        "blown"
    );


    document
        .querySelectorAll(
            ".smoke"
        )
        .forEach(
            smoke => smoke.remove()
        );


    document
        .querySelectorAll(
            ".flame"
        )
        .forEach(
            flame => {

                flame.style.animation =
                    "";

                flame.style.opacity =
                    "1";

                flame.style.transform =
                    "translateX(-50%)";

            }
        );


    if (blowButton) {

        blowButton.style.display =
            "none";

    }


    if (nextButton) {

        nextButton.style.display =
            "none";

    }


    const title =
        document.getElementById(
            "candle-title"
        );

    const subtitle =
        document.getElementById(
            "candle-subtitle"
        );


    if (title) {

        title.innerHTML =
            'Make a Wish <span class="emoji">🕯️</span>';

    }


    if (subtitle) {

        subtitle.textContent =
            "Tap the button to blow the candles!";

    }


    setTimeout(
        () => {

            bottom.classList.add(
                "animate-base"
            );

            playBounceSound();

        },
        300
    );


    setTimeout(
        () => {

            middle.classList.add(
                "animate-mid"
            );

            playBounceSound();

        },
        950
    );


    setTimeout(
        () => {

            top.classList.add(
                "animate-top"
            );

            playBounceSound();

        },
        1600
    );


    setTimeout(
        () => {

            candles.classList.add(
                "animate-candles"
            );


            if (blowButton) {

                blowButton.style.display =
                    "inline-flex";

            }

        },
        2250
    );

}


/* =====================================================
   BLOW CANDLES
===================================================== */

function blowCandles() {
 createPartyBlast();
    const candles =
        document.querySelector(
            ".candles-wrapper"
        );

    const flames =
        document.querySelectorAll(
            ".flame"
        );


    if (
        !candles ||
        candles.classList.contains(
            "blown"
        )
    ) {

        return;

    }


    candles.classList.add(
        "blown"
    );


    playBlowSound();


    flames.forEach(
        (flame, index) => {

            flame.style.animation =
                "none";

            flame.style.transition =
                "opacity .4s, transform .4s";

            flame.style.opacity =
                "0";

            flame.style.transform =
                "translateX(-50%) scale(.2)";


            setTimeout(
                () => {

                    createSmoke(
                        flame.parentElement
                    );

                },
                250 +
                index * 80
            );

        }
    );


    const blowButton =
        document.getElementById(
            "blowBtn"
        );


    if (blowButton) {

        blowButton.style.display =
            "none";

    }


    const title =
        document.getElementById(
            "candle-title"
        );

    const subtitle =
        document.getElementById(
            "candle-subtitle"
        );


    if (title) {

        title.innerHTML =
            'Wish Made! <span class="emoji">✨</span>';

    }


    if (subtitle) {

        subtitle.textContent =
            "May your dreams bloom this year!";

    }


    setTimeout(
        () => {

            const nextButton =
                document.getElementById(
                    "cakeNextBtn"
                );

            if (nextButton) {

                nextButton.style.display =
                    "inline-flex";

            }

        },
        700
    );

}


/* =====================================================
   SMOKE
===================================================== */

function createSmoke(candle) {

    if (!candle) {
        return;
    }


    const smoke =
        document.createElement(
            "div"
        );


    smoke.className =
        "smoke";


    Object.assign(
        smoke.style,
        {
            position: "absolute",
            width: "7px",
            height: "7px",
            left: "50%",
            top: "-25px",
            transform:
                "translateX(-50%)",
            borderRadius: "50%",
            background:
                "#b4b4b48c",
            filter: "blur(1px)",
            pointerEvents: "none"
        }
    );


    candle.appendChild(
        smoke
    );


    smoke.animate(
        [
            {
                opacity: .7,

                transform:
                    "translate(-50%,0) scale(1)"
            },

            {
                opacity: 0,

                transform:
                    "translate(-50%,-35px) scale(2.2)"
            }
        ],
        {
            duration: 1000,
            easing: "ease-out"
        }
    );


    setTimeout(
        () => {

            smoke.remove();

        },
        1000
    );

}


/* =====================================================
   GO TO MEMORIES
===================================================== */

function goToMemoriesDirectly() {

    playTapSound();

    nextScreen(8);

}


/* =====================================================
   MEMORY DATA
===================================================== */

const memoryPhotos = [

    "memory1.jpg",
    "memory2.jpg",
    "memory3.jpg",
    "memory4.jpg",
    "memory5.jpg",
    "memory6.jpg",
    "memory7.jpg",
    "memory8.jpg"

];


const memoryCaptions = [

    "A beautiful little memory ✨",

    "One of those moments worth remembering ♡",

    "A tiny moment, a big memory 🌸",

    "Good times and good vibes ✨",

    "Another page of the story 💗",

    "A moment frozen in time 🌷",

    "Some memories just stay special ♡",

    "And this one deserves a place here ✨"

];


/* =====================================================
   UPDATE MEMORY
===================================================== */

function updateMemory() {

    const image =
        document.getElementById(
            "memoryImage"
        );

    const caption =
        document.getElementById(
            "memoryCaption"
        );

    const counter =
        document.getElementById(
            "memoryCounter"
        );

    const dots =
        document.getElementById(
            "memoryDots"
        );


    if (!image) {
        return;
    }


    /* OLD PHOTO EXIT */

    image.style.transition =
        "opacity .22s ease, transform .22s ease";

    image.style.opacity =
        "0";

    image.style.transform =
        "scale(.92)";


    setTimeout(
        () => {

            /* CHANGE PHOTO */

            image.src =
                memoryPhotos[
                    currentMemory
                ];


            if (caption) {

                caption.textContent =
                    memoryCaptions[
                        currentMemory
                    ];

            }


            if (counter) {

                counter.textContent =
                    `${currentMemory + 1} / ${memoryPhotos.length}`;

            }


            /* NEW PHOTO */

            image.style.transition =
                "none";

            image.style.opacity =
                "0";

            image.style.transform =
                "scale(.94)";


            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            image.style.transition =
                                "opacity .45s ease, transform .55s cubic-bezier(.17,.89,.32,1.25)";

                            image.style.opacity =
                                "1";

                            image.style.transform =
                                "scale(1)";

                        }
                    );

                }
            );

        },
        220
    );


    /* DOTS */

    if (dots) {

        dots.innerHTML = "";


        memoryPhotos.forEach(
            (_, index) => {

                const dot =
                    document.createElement(
                        "span"
                    );


                dot.className =
                    "memory-dot" +
                    (
                        index === currentMemory
                            ? " active"
                            : ""
                    );


                dot.onclick =
                    () => {

                        currentMemory =
                            index;

                        updateMemory();

                    };


                dots.appendChild(
                    dot
                );

            }
        );

    }

}


/* =====================================================
   NEXT MEMORY
===================================================== */

function nextMemory() {

    currentMemory =
        (
            currentMemory + 1
        ) %
        memoryPhotos.length;


    updateMemory();

}


/* =====================================================
   PREVIOUS MEMORY
===================================================== */

function previousMemory() {

    currentMemory =
        (
            currentMemory - 1 +
            memoryPhotos.length
        ) %
        memoryPhotos.length;


    updateMemory();

}


/* =====================================================
   SWIPE
===================================================== */

let touchX = 0;

const memoryGallery =
    document.getElementById(
        "memoryGallery"
    );


if (memoryGallery) {

    memoryGallery.addEventListener(
        "touchstart",
        event => {

            touchX =
                event.changedTouches[0]
                    .screenX;

        },
        {
            passive: true
        }
    );


    memoryGallery.addEventListener(
        "touchend",
        event => {

            const difference =
                event.changedTouches[0]
                    .screenX -
                touchX;


            if (
                Math.abs(difference) <
                45
            ) {
                return;
            }


            if (
                difference < 0
            ) {

                nextMemory();

            }

            else {

                previousMemory();

            }

        },
        {
            passive: true
        }
    );

}


/* =====================================================
   FINAL LETTER
===================================================== */

function goToFinalLetter() {

    playTapSound();

    nextScreen(9);

}


/* =====================================================
   PREVIOUS PAGE
===================================================== */

function goToPreviousPage() {

    playTapSound();


    if (
        currentScreen > 1
    ) {

        nextScreen(
            currentScreen - 1
        );

    }

}


/* =====================================================
   LETTER MESSAGE
===================================================== */

const finalMessage =
`Happy birthdayyyy myy all time savior... 🎂💗

Yk naa how much I love youuuu...
Tere bina mera sab kaam adhura reh jata haiii...

I wish amra shobai ekloge thakii alwaysss,
kunodino alada na hoii...
kunodino amgo friendship-e kuno khechrichu*i r nazar na poruk...

I LOVE YOUU MWAHHHH. 💗🫶`;
/* =====================================================
   RESET LETTER
===================================================== */

function resetLetterIfNeeded() {

    if (!letterOpened) {

        const envelope =
            document.querySelector(
                ".envelope"
            );

        const text =
            document.getElementById(
                "letterText"
            );

        const hint =
            document.getElementById(
                "letterHint"
            );


        if (envelope) {

            envelope.classList.remove(
                "open"
            );

        }


        if (text) {

            text.textContent = "";

        }


        if (hint) {

            hint.style.opacity =
                "1";

        }

    }

}


/* =====================================================
   OPEN LETTER
===================================================== */

function openLetter() {

    const envelope =
        document.querySelector(
            ".envelope"
        );

    const letterText =
        document.getElementById(
            "letterText"
        );

    const hint =
        document.getElementById(
            "letterHint"
        );


    if (
        !envelope ||
        !letterText
    ) {
        return;
    }


    envelope.classList.add(
        "open"
    );


    if (hint) {

        hint.style.opacity =
            "0";

    }


    if (letterOpened) {
        return;
    }


    letterOpened = true;


    let index = 0;


    letterText.textContent = "";


    clearInterval(
        typingTimer
    );


    typingTimer =
        setInterval(
            () => {

                if (
                    index <
                    finalMessage.length
                ) {

                    letterText.textContent +=
                        finalMessage[
                            index
                        ];

                    index++;

                }

                else {

                    clearInterval(
                        typingTimer
                    );

                }

            },
            22
        );

}


/* =====================================================
   KEYBOARD SUPPORT FOR DOB
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            currentScreen === 3
        ) {

            if (
                /^\d$/.test(
                    event.key
                )
            ) {

                pressKey(
                    event.key
                );

            }


            if (
                event.key ===
                "Backspace"
            ) {

                deleteKey();

            }


            if (
                event.key ===
                "Enter"
            ) {

                submitDOB();

            }

        }

    }
);


/* =====================================================
   INITIAL MEMORY SETUP
===================================================== */

updateMemory();

function showBirthdayReveal() {
    playPartySound();
    nextScreen(6);
}
function createPartyBlast() {

    // Aapke theme ke custom pastel & glowing accents
    const colors = [
        "#ff7597", // --primary-pink
        "#ffd3e0", // --soft-pink
        "#bfa2db", // --lavender
        "#8e44ad", // deep purple/lavender accent
        "#ffd000", // candle flame gold
        "#48bb78", // sprinkle green
        "#ffffff"  // sparkling white
    ];

    for (let i = 0; i < 90; i++) {

        const piece = document.createElement("span");

        piece.className = "party-confetti";

        piece.style.setProperty(
            "--paper-color",
            colors[Math.floor(Math.random() * colors.length)]
        );

        // Wide spread across the screen
        piece.style.setProperty(
            "--x",
            `${(Math.random() - 0.5) * 650}px`
        );

        // Upward burst height
        piece.style.setProperty(
            "--y",
            `${-Math.random() * 380 - 80}px`
        );

        // 3D rotation angles (realistic tumble)
        piece.style.setProperty(
            "--rx",
            `${Math.random() * 800 - 400}deg`
        );

        piece.style.setProperty(
            "--ry",
            `${Math.random() * 1000 - 500}deg`
        );

        piece.style.setProperty(
            "--rz",
            `${Math.random() * 600 - 300}deg`
        );

        piece.style.setProperty(
            "--delay",
            `${Math.random() * 0.15}s`
        );

        document.body.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 2400);
    }
}
