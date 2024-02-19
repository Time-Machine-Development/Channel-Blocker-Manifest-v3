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
        faqContactSection.classList.toggle("active", false);
        faqPrivacySection.classList.toggle("active", false);
        faqTroubleshootingSection.classList.toggle("active", false);
    });
    faqContactHeading.addEventListener("click", () => {
        faqPermissionSection.classList.toggle("active", false);
        faqContactSection.classList.toggle("active");
        faqPrivacySection.classList.toggle("active", false);
        faqTroubleshootingSection.classList.toggle("active", false);
    });
    faqPrivacyHeading.addEventListener("click", () => {
        faqPermissionSection.classList.toggle("active", false);
        faqContactSection.classList.toggle("active", false);
        faqPrivacySection.classList.toggle("active");
        faqTroubleshootingSection.classList.toggle("active", false);
    });
    faqTroubleshootingHeading.addEventListener("click", () => {
        faqPermissionSection.classList.toggle("active", false);
        faqContactSection.classList.toggle("active", false);
        faqPrivacySection.classList.toggle("active", false);
        faqTroubleshootingSection.classList.toggle("active");
    });
}
