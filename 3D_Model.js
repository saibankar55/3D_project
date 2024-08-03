import { GLTFLoader } from "../../libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";
import { Raycaster, Vector2, TextureLoader, PlaneGeometry, MeshBasicMaterial, Mesh, VideoTexture } from "../../libs/three.js-r132/build/three.module.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: '../../assets/targets/pc.mind',
        });
        const { renderer, scene, camera } = mindarThree;

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);  

        const anchor = mindarThree.addAnchor(0);

        const loader = new GLTFLoader();
        const textureLoader = new TextureLoader();
        const raycaster = new Raycaster();
        const mouse = new Vector2();

        let pcModel; // Declare a variable to hold the pc model

        // Load the first GLTF model
        loader.load("../../assets/models/product/pc.gltf", (gltf) => {
            pcModel = gltf.scene;
            pcModel.scale.set(0.1, 0.1, 0.1);
            pcModel.position.set(0.1, -0.1, 0.0);
            anchor.group.add(pcModel);

            // Add click event to open the link
            document.addEventListener('click', (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(pcModel.children, true);

                if (intersects.length > 0) {
                    console.log('Model clicked: Opening https://www.youtube.com/watch?v=XV1cOGaZUq0');
                    window.open("https://www.youtube.com/watch?v=XV1cOGaZUq0", '_blank');
                }
            });
        }, undefined, (error) => {
            console.error('An error occurred while loading the GLTF model:', error);
        });

        // Social media icons data
        const socialMedia = [
            { url: 'https://www.facebook.com', icon: '../../assets/icons/facebook1.png', position: { x: -0.3, y: -0.5, z: 0 } },
            { url: 'https://www.twitter.com', icon: '../../assets/icons/whatsapp1.png', position: { x: -0.1, y: -0.5, z: 0 } },
            { url: 'https://www.instagram.com', icon: '../../assets/icons/instagram1.png', position: { x: 0.1, y: -0.5, z: 0 } },
            { url: 'https://www.linkedin.com', icon: '../../assets/icons/linkedin1.png', position: { x: 0.3, y: -0.5, z: 0 } },
        ];

        socialMedia.forEach((sm) => {
            textureLoader.load(sm.icon, (texture) => {
                const geometry = new PlaneGeometry(0.1, 0.1);
                const material = new MeshBasicMaterial({ map: texture, transparent: true });
                const mesh = new Mesh(geometry, material);

                mesh.position.set(sm.position.x, sm.position.y, sm.position.z);
                anchor.group.add(mesh);

                mesh.userData.url = sm.url;

                // Add click event for social media icons
                document.addEventListener('click', (event) => {
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObject(mesh, true);

                    if (intersects.length > 0) {
                        console.log(`Icon clicked: Opening ${mesh.userData.url}`);
                        window.open(mesh.userData.url, '_blank');
                    }
                });
            }, undefined, (error) => {
                console.error(`An error occurred while loading the texture for ${sm.url}:`, error);
            });
        });

        // Add a video to the AR scene
        const videoElement = document.createElement('video');
        videoElement.src = '../../assets/videos/mit.mp4'; // Replace with your video path
        videoElement.crossOrigin = 'anonymous';
        videoElement.loop = true;
        videoElement.volume = 1.0; // Set the volume level
        videoElement.muted = false; // Ensure it's not muted

        // Debugging event listeners
        videoElement.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully.');
        });
        videoElement.addEventListener('error', (err) => {
            console.error('Video error:', err);
        });

        const videoTexture = new VideoTexture(videoElement);
        const videoGeometry = new PlaneGeometry(1, 0.56); // Adjust dimensions as needed
        const videoMaterial = new MeshBasicMaterial({ map: videoTexture });
        const videoMesh = new Mesh(videoGeometry, videoMaterial);

        videoMesh.position.set(-0.0, 0.8, 0); // Position the video mesh
        anchor.group.add(videoMesh);

        // Event to handle target found
        anchor.onTargetFound = () => {
            console.log('Target found: Playing video');
            videoElement.play();
        };

        // Event to handle target lost
        anchor.onTargetLost = () => {
            console.log('Target lost: Stopping video');
            videoElement.pause();
        };

        await mindarThree.start();

        renderer.setAnimationLoop(() => {
            if (pcModel) {
                pcModel.rotation.y += 0.01; // Rotate the pc model continuously
            }
            renderer.render(scene, camera);
        });
    }

    start();
});
