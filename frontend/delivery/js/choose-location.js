document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".delivery-location-picker");
    if (!main) return;

    const header = main.querySelector(".delivery-location-header");
    const permission = document.getElementById("location-permission-container");
    const mapWrapper = main.querySelector(".delivery-map-wrapper");
    const address = document.getElementById("address-fallback-container");
    const message = document.getElementById("delivery-location-message");
    const coordinates = document.getElementById("delivery-map-coordinates");
    const confirmButton = document.getElementById("confirm-map-location-button");
    const status = document.getElementById("location-status-container");

    const chooser = document.createElement("section");
    chooser.id = "choose-location-section";

    chooser.innerHTML = `
        <div class="choose-location-header">
            <p>DELIVERY LOCATION</p>
            <h2>Choose one</h2>
            <span>Select how you want to set your delivery location.</span>
        </div>

        <div class="choose-location-options">
            <button type="button" data-location-choice="gps">
                <strong>📍 Use Current Location</strong>
                <span>Use your phone's current location</span>
            </button>

            <button type="button" data-location-choice="map">
                <strong>🗺️ Choose on Map</strong>
                <span>Select your exact delivery point</span>
            </button>

            <button type="button" data-location-choice="address">
                <strong>🏠 Use Saved Address</strong>
                <span>Choose an address from your account</span>
            </button>
        </div>
    `;

    const style = document.createElement("style");

    style.textContent = `
        .delivery-location-header {
            display: none !important;
        }

        #choose-location-section {
            margin: 0 0 24px;
            padding: 20px;
            border: 1px solid #e2e2e2;
            border-radius: 16px;
            background: #fff;
        }

        .choose-location-header p {
            margin: 0 0 5px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: #777;
        }

        .choose-location-header h2 {
            margin: 0;
            font-size: 25px;
            line-height: 1.2;
        }

        .choose-location-header span {
            display: block;
            margin-top: 6px;
            color: #666;
            font-size: 14px;
        }

        .choose-location-options {
            display: grid;
            gap: 10px;
            margin-top: 16px;
        }

        .choose-location-options button {
            width: 100%;
            padding: 15px;
            border: 1px solid #d8d8d8;
            border-radius: 12px;
            background: #fff;
            text-align: left;
            cursor: pointer;
        }

        .choose-location-options button.selected {
            border-color: #111;
            background: #f7f7f7;
        }

        .choose-location-options strong,
        .choose-location-options span {
            display: block;
        }

        .choose-location-options strong {
            font-size: 15px;
            color: #111;
        }

        .choose-location-options span {
            margin-top: 4px;
            font-size: 13px;
            color: #666;
        }

        #location-permission-container {
            display: none !important;
        }

        .delivery-map-wrapper,
        #address-fallback-container,
        #delivery-location-message,
        #delivery-map-coordinates,
        #confirm-map-location-button,
        #location-status-container {
            display: none;
        }
    `;

    document.head.appendChild(style);
    main.insertBefore(chooser, main.firstChild);

    const hideAllChoices = () => {
        if (mapWrapper) mapWrapper.style.display = "none";
        if (address) address.style.display = "none";
        if (message) message.style.display = "none";
        if (coordinates) coordinates.style.display = "none";
        if (confirmButton) confirmButton.style.display = "none";
        if (status) status.style.display = "none";
    };

    const showMap = () => {
        if (mapWrapper) mapWrapper.style.display = "block";
        if (coordinates) coordinates.style.display = "block";
        if (confirmButton) confirmButton.style.display = "block";

        window.dispatchEvent(new Event("deliveryMapVisible"));
    };

    const selectButton = (button) => {
        chooser
            .querySelectorAll("button")
            .forEach((item) => item.classList.remove("selected"));

        button.classList.add("selected");
    };

    hideAllChoices();

    chooser.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", async () => {
            const choice = button.dataset.locationChoice;

            selectButton(button);
            hideAllChoices();

            if (choice === "gps") {
                showMap();

                if (
                    typeof window.getCurrentLocation !== "function"
                ) {
                    return;
                }

                try {
                    const location =
                        await window.getCurrentLocation();

                    if (
                        typeof window.setDeliveryMapLocation ===
                        "function"
                    ) {
                        window.setDeliveryMapLocation(
                            location.latitude,
                            location.longitude,
                            17,
                            "gps"
                        );
                    }

                    if (message) {
                        message.style.display = "block";
                    }
                } catch (error) {
                    if (message) {
                        message.style.display = "block";
                        message.textContent =
                            error.message ||
                            "Unable to get your current location.";
                    }
                }

                return;
            }

            if (choice === "map") {
                showMap();

                window.dispatchEvent(new Event("deliveryMapVisible"));

                return;
            }

            if (choice === "address") {
                if (address) {
                    address.style.display = "block";
                }
            }
        });
    });
});
