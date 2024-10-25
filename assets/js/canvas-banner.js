// idea: after a while, make the svg's disappear (fade away) and generate them at new positions

function canvas() {
    const canvas = document.getElementById('bannerCanvas');
    const ctx = canvas.getContext('2d');

    const svgUrls = [
        '/website-test/public/banner-svg/matrix.svg',
        '/website-test/public/banner-svg/stokes.svg',
        '/website-test/public/banner-svg/laplace.svg',
        '/website-test/public/banner-svg/discrete-fourier.svg',
        '/website-test/public/banner-svg/cauchy.svg',
        '/website-test/public/banner-svg/black-body.svg'
    ];
    const svgImages = [];
    const numSvgs = svgUrls.length;

    // Configuration
    const speed = 1.5; // Speed of the SVGs
    const rotationSpeed = 0.01; // Speed of rotation (radians per frame)
    let svgScaleFactor = 1.6; // Initial scale factor
    const ROTATE = false;
    
    let svgs = []; // Keep track of all SVGs including original and added
    const addedSvgs = []; // Track added SVGs by clicks

    // Load SVG images
    svgUrls.forEach((url, index) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            svgImages[index] = img;
            if (svgImages.length === numSvgs) {
                startAnimation();
            }
        };
    });

    function startAnimation() {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
    
        // Create initial positions, movement directions, and rotation angles for original SVGs
        svgs = svgImages.map(img => ({
            x: Math.random() * (canvasWidth - img.width * svgScaleFactor),
            y: Math.random() * (canvasHeight - img.height * svgScaleFactor),
            dx: (Math.random() - 0.5) * speed,
            dy: (Math.random() - 0.5) * speed,
            angle: Math.random() * Math.PI * 2, // Initial random angle
            dAngle: (Math.random() - 0.5) * rotationSpeed, // Random rotation speed
            img,
            permanent: true // Mark original SVGs as permanent
        }));
    
        const desiredFPS = 40; // Default is 60
        const interval = 1000 / desiredFPS; // Time per frame in milliseconds
        let lastTime = 0;
    
        function animate(time) {
            if (time - lastTime >= interval) {
                lastTime = time;
    
                // Clear the entire canvas to prevent trailing
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                // Filter out SVGs that are out of bounds
                svgs.forEach((svg, index) => {
                    // Check if the SVG is out of bounds
                    const isOutOfBounds =
                        svg.x + svg.img.width * svgScaleFactor < 0 ||
                        svg.x > canvas.width ||
                        svg.y + svg.img.height * svgScaleFactor < 0 ||
                        svg.y > canvas.height;
    
                    if (isOutOfBounds) {
                        // Remove the out-of-frame SVG
                        svgs.splice(index, 1);
    
                        // Re-add the SVG after 1 second at a random position within the canvas
                        setTimeout(() => {
                            svg.x = Math.random() * (canvasWidth - svg.img.width * svgScaleFactor);
                            svg.y = Math.random() * (canvasHeight - svg.img.height * svgScaleFactor);
                            svgs.push(svg); // Re-add the SVG to the array
                        }, 100);
                    }
                });
    
                // Move and render the remaining SVGs
                svgs.forEach((svg) => {
                    // Move SVG
                    svg.x += svg.dx;
                    svg.y += svg.dy;
    
                    // Bounce off the borders
                    if (svg.x < 0 || svg.x > canvas.width - svg.img.width * svgScaleFactor) svg.dx *= -1;
                    if (svg.y < 0 || svg.y > canvas.height - svg.img.height * svgScaleFactor) svg.dy *= -1;
    
                    // Save the context and apply the transformation
                    ctx.save();
                    ctx.translate(svg.x + (svg.img.width * svgScaleFactor) / 2, svg.y + (svg.img.height * svgScaleFactor) / 2); // Move to the center of the image
                    if (ROTATE) {
                        // Rotate SVG
                        svg.angle += svg.dAngle;
                        ctx.rotate(svg.angle); // Rotate around the center
                    }
                    ctx.drawImage(
                        svg.img,
                        -(svg.img.width * svgScaleFactor) / 2, 
                        -(svg.img.height * svgScaleFactor) / 2, 
                        svg.img.width * svgScaleFactor, 
                        svg.img.height * svgScaleFactor
                    ); // Draw the scaled image
                    ctx.restore();
                });
            }
            requestAnimationFrame(animate);
        }
    
        animate(desiredFPS);
    }
    

    // Resize the canvas to fit its container
    function fitToContainer(canvas) {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    function resizeCanvas() {
        fitToContainer(canvas);

        if(window.innerWidth < 580){
            svgScaleFactor = 0.6;
        }
        else if(window.innerWidth > 1800){
            svgScaleFactor = 1.2;
        }
        else if(window.innerWidth > 2400){
            svgScaleFactor = 2.5;
        }
        else{
            svgScaleFactor = 1;
        }
    }

    // Attach the resize event
    window.addEventListener('resize', resizeCanvas); // scale SVGs when resize window
    resizeCanvas();

    // Function to add a new SVG at the clicked position
    function addSvgAt(x, y) {
        const randomSvg = svgImages[Math.floor(Math.random() * numSvgs)];
        const newSvg = {
            x: x - (randomSvg.width * svgScaleFactor) / 2,
            y: y - (randomSvg.height * svgScaleFactor) / 2,
            dx: (Math.random() - 0.5) * speed,
            dy: (Math.random() - 0.5) * speed,
            angle: Math.random() * Math.PI * 2,
            dAngle: (Math.random() - 0.5) * rotationSpeed,
            img: randomSvg,
            permanent: false // Mark this SVG as temporary
        };
        svgs.push(newSvg);
        addedSvgs.push(newSvg);

        // Set a timer to remove the SVG after 5 seconds
        setTimeout(() => {
            const index = svgs.indexOf(newSvg);
            if (index !== -1) {
                svgs.splice(index, 1); // Remove the SVG from the main array
            }
        }, 5000);
    }

    // Attach the click event to the canvas
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addSvgAt(x, y);
    });

    return {
        resizeCanvas: resizeCanvas
    };
}




// Load the banner and start the canvas animation
$(function() {
    $(".home-banner").load("../assets/source/home-banner.html", function() {
        canvas();
    });
});