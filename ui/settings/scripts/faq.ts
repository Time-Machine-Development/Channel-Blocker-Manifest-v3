export function initFaq() {
    const faqPermissionHeading = document.getElementById("faq-permission-heading") as HTMLDivElement;
    const faqContactHeading = document.getElementById("faq-contact-heading") as HTMLDivElement;
    const faqPrivacyHeading = document.getElementById("faq-privacy-heading") as HTMLDivElement;
    const faqTroubleshootingHeading = document.getElementById("faq-troubleshooting-heading") as HTMLDivElement;

    const faqPermissionSection = document.getElementById("faq-permission-section") as HTMLDivElement;
    const faqContactSection = document.getElementById("faq-contact-section") as HTMLDivElement;
    const faqPrivacySection = document.getElementById("faq-privacy-section") as HTMLDivElement;
    const faqTroubleshootingSection = document.getElementById("faq-troubleshooting-section") as HTMLDivElement;

    faqPermissionHeading.addEventListener("click", () => {
        faqPermissionSection.classList.toggle("active");
    });
    faqContactHeading.addEventListener("click", () => {
        faqContactSection.classList.toggle("active");
    });
    faqPrivacyHeading.addEventListener("click", () => {
        faqPrivacySection.classList.toggle("active");
    });
    faqTroubleshootingHeading.addEventListener("click", () => {
        faqTroubleshootingSection.classList.toggle("active");
    });
}
