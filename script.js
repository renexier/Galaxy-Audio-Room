const scene =
new THREE.Scene();

const camera =
new THREE.PerspectiveCamera(

75,

window.innerWidth /
window.innerHeight,

0.1,

1000
);

camera.position.z = 30;

const renderer =
new THREE.WebGLRenderer({

    canvas:
    document.getElementById("bg"),

    antialias:true
});

renderer.setSize(

window.innerWidth,
window.innerHeight
);

renderer.setPixelRatio(
window.devicePixelRatio
);

const starsGeometry =
new THREE.BufferGeometry();

const starsCount = 6000;

const positions =
new Float32Array(
starsCount * 3
);

for(let i=0;i<starsCount*3;i++){

    positions[i] =
    (Math.random()-0.5)*220;
}

starsGeometry.setAttribute(

"position",

new THREE.BufferAttribute(
positions,
3
)
);

const starsMaterial =
new THREE.PointsMaterial({

    color:0xffffff,

    size:0.12
});

const starField =
new THREE.Points(

starsGeometry,

starsMaterial
);

scene.add(starField);

const visualizer =
document.getElementById("visualizer");

const bars = [];

for(let i=0;i<72;i++){

    const bar =
    document.createElement("div");

    bar.className="bar";

    visualizer.appendChild(bar);

    bars.push(bar);
}

let audioEnabled = false;

let analyser;

let dataArray;

let streamRef;

async function toggleMic(){

    const micBtn =
    document.getElementById("micBtn");

    if(!audioEnabled){

        const stream =
        await navigator
        .mediaDevices
        .getUserMedia({

            audio:true
        });

        streamRef = stream;

        const audioContext =
        new AudioContext();

        analyser =
        audioContext
        .createAnalyser();

        analyser.fftSize = 256;

        const source =
        audioContext
        .createMediaStreamSource(
        stream
        );

        source.connect(analyser);

        dataArray =
        new Uint8Array(
        analyser.frequencyBinCount
        );

        audioEnabled = true;

        micBtn.innerText =
        "MIC ON";

    }else{

        streamRef
        .getTracks()
        .forEach(track=>{

            track.stop();
        });

        audioEnabled = false;

        micBtn.innerText =
        "MIC OFF";

        bars.forEach(bar=>{

            bar.style.height =
            "10px";
        });
    }
}

document
.getElementById("micBtn")
.onclick =
toggleMic;

document.addEventListener(
"mousemove",
e=>{

    const x =
    (e.clientX/window.innerWidth - 0.5);

    const y =
    (e.clientY/window.innerHeight - 0.5);

    camera.position.x =
    x * 6;

    camera.position.y =
    -y * 3;

    starField.rotation.y =
    x * 0.2;

    const room =
    document.getElementById("room");

    room.style.transform =
    `
    rotateY(${x*12}deg)
    rotateX(${-y*10}deg)
    `;

    document.body.style.setProperty(
    "--x",
    `${x*100 + 50}%`
    );

    document.body.style.setProperty(
    "--y",
    `${y*100 + 50}%`
    );
});

document.addEventListener(
"click",
e=>{

    for(let i=0;i<24;i++){

        const burst =
        document.createElement("div");

        burst.style.position =
        "fixed";

        burst.style.left =
        e.clientX + "px";

        burst.style.top =
        e.clientY + "px";

        burst.style.width =
        "6px";

        burst.style.height =
        "6px";

        burst.style.borderRadius =
        "50%";

        burst.style.background =
        "white";

        burst.style.boxShadow =
        "0 0 20px white";

        burst.style.pointerEvents =
        "none";

        burst.style.zIndex =
        "999";

        const angle =
        Math.random() * Math.PI * 2;

        const distance =
        150 + Math.random()*250;

        burst.animate([

            {
                transform:
                "translate(0px,0px) scale(1)",

                opacity:1
            },

            {
                transform:
                `translate(
                ${Math.cos(angle)*distance}px,
                ${Math.sin(angle)*distance}px
                ) scale(0)`,

                opacity:0
            }

        ],{

            duration:1000,

            easing:"cubic-bezier(.17,.67,.4,1)"
        });

        document.body.appendChild(
        burst
        );

        setTimeout(()=>{

            burst.remove();

        },1000);
    }
});

const themes = [

    {
        name:"CYBERPUNK",
        primary:"#8c00ff",
        secondary:"#00d9ff",
        glow:"rgba(140,0,255,0.45)"
    },

    {
        name:"INFERNO",
        primary:"#ff3c00",
        secondary:"#ffcc00",
        glow:"rgba(255,80,0,0.45)"
    },

    {
        name:"OCEAN",
        primary:"#009dff",
        secondary:"#00ffe1",
        glow:"rgba(0,150,255,0.45)"
    }
];

let themeIndex = 0;

function applyTheme(theme){

    document.documentElement
    .style
    .setProperty(
    "--primary",
    theme.primary
    );

    document.documentElement
    .style
    .setProperty(
    "--secondary",
    theme.secondary
    );

    document.documentElement
    .style
    .setProperty(
    "--glow",
    theme.glow
    );
}

applyTheme(themes[0]);

document
.getElementById("themeBtn")
.onclick=()=>{

    themeIndex++;

    if(themeIndex >= themes.length){

        themeIndex = 0;
    }

    applyTheme(themes[themeIndex]);

    document
    .getElementById("themeBtn")
    .innerText =
    themes[themeIndex].name;
};

const panel =
document.getElementById("infoPanel");

document
.getElementById("infoBtn")
.onclick=()=>{

    panel.classList.remove(
    "hidden"
    );
};

document
.getElementById("closeBtn")
.onclick=()=>{

    panel.classList.add(
    "hidden"
    );
};

function animate(){

    requestAnimationFrame(
    animate
    );

    starField.rotation.y +=
    0.0004;

    if(audioEnabled){

        analyser
        .getByteFrequencyData(
        dataArray
        );

        bars.forEach((bar,i)=>{

            const value =
            dataArray[i];

            const height =
            Math.max(8,value*1.3);

            bar.style.height =
            `${height}px`;

            bar.style.opacity =
            value/255 + 0.2;
        });

        const bass =
        dataArray[2] +
        dataArray[3];

        document
        .querySelectorAll(".speaker-ring")
        .forEach(ring=>{

            ring.style.transform =
            `scale(${1 + bass/700})`;
        });

        document
        .getElementById("floorGlow")
        .style.transform =
        `
        translateX(-50%)
        scale(${1 + bass/350})
        `;

        const hue =
        bass * 0.4;

        starField.material.color.setHSL(

        (hue % 360)/360,

        1,

        0.7
        );

        renderer.setClearColor(

        new THREE.Color(

        `hsl(${hue},70%,6%)`

        )
        );
    }

    renderer.render(
    scene,
    camera
    );
}

animate();

window.addEventListener(
"resize",
()=>{

    camera.aspect =
    window.innerWidth /
    window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(

    window.innerWidth,

    window.innerHeight
    );
});