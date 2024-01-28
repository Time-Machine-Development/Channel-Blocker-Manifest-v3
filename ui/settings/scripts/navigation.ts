export function initNavigation() {
    const burgerMenu = document.getElementById("burger-menu") as HTMLButtonElement;
    const nav = document.getElementById("main-nav") as HTMLElement;

    console.log("burgerMenu", burgerMenu);

    burgerMenu.addEventListener("click", () => {
        nav.classList.toggle("open");
        console.log("toggle nav");
    });
}
