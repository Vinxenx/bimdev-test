document.addEventListener("DOMContentLoaded", () => {
    // New Project Modal
    const newProjectModal = document.getElementById('new-project-modal');
    const openNewProjectButton = document.getElementById('new-project-btn'); // Der "New Project" Button im Header

    openNewProjectButton.addEventListener('click', () => {
        newProjectModal.showModal();
    });

    // Event Listener zum Schließen des Dialogs, wenn auf den "Cancel"-Button geklickt wird
    const cancelProjectButton = newProjectModal.querySelector('button[type="button"]');
    cancelProjectButton.addEventListener('click', () => {
        newProjectModal.close();
    });

    // Add Person Modal
    const addPersonModal = document.getElementById('add-person');
    const openAddPersonButton = document.getElementById('open-add-person-modal'); // Der "Add Person" Button

    openAddPersonButton.addEventListener('click', () => {
        addPersonModal.showModal();
    });

    // Event Listener zum Schließen des Dialogs, wenn auf den "Cancel"-Button geklickt wird
    const cancelAddPersonButton = addPersonModal.querySelector('button[type="button"]');
    cancelAddPersonButton.addEventListener('click', () => {
        addPersonModal.close();
    });
});