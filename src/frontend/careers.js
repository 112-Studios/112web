// Check if the script is running correctly
console.log("Career positions script is running");

document.addEventListener('DOMContentLoaded', () => {
    const positions = [
        { title: "UI & UX Designer (1x)", description: "As a UI & UX Designer at 112-Studios, you will be responsible for crafting intuitive and visually appealing user interfaces while ensuring an optimal user experience. You will design and implement user interfaces that are both functional and aesthetically pleasing, and collaborate closely with other team members to ensure a seamless and engaging player experience. Your role will also involve conducting user research and usability testing to refine designs and enhance the overall user journey." },
        { title: "Quality Assurance Tester (1x)", description: "As a Quality Assurance Tester at 112-Studios, you will play a critical role in ensuring the quality and stability of our games. You will be responsible for conducting thorough testing of game features and functionalities to identify bugs, inconsistencies, and issues. Your work will involve documenting findings, collaborating with the development team to resolve issues, and ensuring that the final product meets our high standards of quality before release." },
        { title: "Texturer (1x)", description: "As a Texturer at 112-Studios, you will be responsible for creating and applying textures to 3D models and environments to enhance their visual realism and detail. You will work closely with modelers and artists to develop high-quality textures that bring our game assets to life. Your role will involve collaborating with the team to ensure that textures align with the artistic vision of our projects and contribute to an immersive gaming experience." }
    ];
    
    const careersContainer = document.getElementById("positions-list");
    const noPositions = document.getElementById("no-positions"); 
    
    // Clear existing content in the container
    careersContainer.innerHTML = '';
    
    console.log('Positions loaded:', positions);
    
    if (positions.length > 0) {
        noPositions.style.display = 'none';
        positions.forEach((position) => {
            const positionDiv = document.createElement("div");
            positionDiv.classList.add("to-be-divved");
            positionDiv.innerHTML = `<h2>${position.title}</h2><p>${position.description}</p>`;
            careersContainer.appendChild(positionDiv);
            console.log("Div inserted")
        });
    } else {
        noPositions.style.display = 'block';
        console.log("No Positions Found.(log)")
    }

    console.log('Careers container:', careersContainer);
});
