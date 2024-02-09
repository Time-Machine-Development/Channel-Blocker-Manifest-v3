const donateButton = document.getElementById("donate-btn") as HTMLButtonElement;
const donateButtonPaypal = document.getElementById("donate-btn-paypal") as HTMLButtonElement;
const donateButtonPatreon = document.getElementById("donate-btn-patreon") as HTMLButtonElement;
const closeDonationButton = document.getElementById("close-donation-btn") as HTMLButtonElement;
const donationContainer = document.getElementById("donation-container") as HTMLDivElement;

const paypalDonationUrl = "https://www.paypal.com/donate/?hosted_button_id=KYJWDCH3ZJ4U2";
const patreonUrl = "https://www.patreon.com/time_machine_development";

export function initDonation() {
    donateButton.addEventListener("click", () => {
        donationContainer.classList.add("open");
    });
    closeDonationButton.addEventListener("click", () => {
        donationContainer.classList.remove("open");
    });
    donateButtonPaypal.addEventListener("click", () => {
        window.open(paypalDonationUrl, "_blank");
    });
    donateButtonPatreon.addEventListener("click", () => {
        window.open(patreonUrl, "_blank");
    });
}
