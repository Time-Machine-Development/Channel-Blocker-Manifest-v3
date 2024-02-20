const donateButton = document.getElementById("donate-btn") as HTMLButtonElement;
const donateButtonPaypal = document.getElementById("donate-btn-paypal") as HTMLButtonElement;
const donateButtonPatreon = document.getElementById("donate-btn-patreon") as HTMLButtonElement;
const closeDonationButton = document.getElementById("close-donation-btn") as HTMLButtonElement;
const donationDialog = document.getElementById("donation-dialog") as HTMLDialogElement;

const paypalDonationUrl = "https://www.paypal.com/donate/?hosted_button_id=KYJWDCH3ZJ4U2";
const patreonUrl = "https://www.patreon.com/time_machine_development";

export function initDonation() {
    donateButton.addEventListener("click", () => {
        donationDialog.showModal();
        //donationContainer.classList.add("open");
    });
    closeDonationButton.addEventListener("click", () => {
        donationDialog.close();
        //donationDialog.classList.remove("open");
    });
    donateButtonPaypal.addEventListener("click", () => {
        window.open(paypalDonationUrl, "_blank");
    });
    donateButtonPatreon.addEventListener("click", () => {
        window.open(patreonUrl, "_blank");
    });
}
