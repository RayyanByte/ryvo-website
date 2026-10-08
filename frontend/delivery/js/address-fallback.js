const waitForAddressFallback = (callback) => {
    const container = document.getElementById("address-fallback-container");

    if (
        container &&
        container.querySelector("#delivery-address-fallback")
    ) {
        callback();
        return;
    }

    const observer = new MutationObserver(() => {
        const loaded = container?.querySelector("#delivery-address-fallback");

        if (loaded) {
            observer.disconnect();
            callback();
        }
    });

    if (container) {
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }
};


const ADDRESS_API = "http://localhost:5000/api/addresses/";
const ADDRESS_CHECK_API = "http://localhost:5000/api/delivery/check-saved-address";
const PINCODE_API = "https://api.postalpincode.in/pincode/";


const getAuthToken = () => localStorage.getItem("authToken");


const showPopupMessage = (text) => {
    const el = document.getElementById("delivery-address-popup-message");

    if (!el) return;

    if (text) {
        el.textContent = text;
        el.classList.add("is-visible");
    } else {
        el.textContent = "";
        el.classList.remove("is-visible");
    }
};


const showPincodeStatus = (text, type = "") => {
    const el = document.getElementById("delivery-pincode-status");

    if (!el) return;

    el.classList.remove("is-loading", "is-success", "is-error");

    if (!text) {
        el.textContent = "";
        return;
    }

    el.textContent = text;

    if (type) {
        el.classList.add(type);
    }
};


const fetchPincodeDetails = async (pincode) => {

    const form = document.getElementById("delivery-address-popup-form");

    if (!form) return;

    const stateInput = form.querySelector('[name="state"]');
    const cityInput = form.querySelector('[name="city"]');
    const areaSelect = form.querySelector('[name="area"]');

    if (!stateInput || !cityInput || !areaSelect) return;

    showPincodeStatus("Checking pincode...", "is-loading");

    stateInput.value = "";
    cityInput.value = "";

    areaSelect.innerHTML = '<option value="">Loading areas...</option>';
    areaSelect.disabled = true;

    try {

        const response = await fetch(`${PINCODE_API}${pincode}`);
        const data = await response.json();

        if (
            !Array.isArray(data) ||
            !data.length ||
            data[0].Status !== "Success" ||
            !Array.isArray(data[0].PostOffice) ||
            !data[0].PostOffice.length
        ) {
            showPincodeStatus("Invalid pincode. Please check and try again.", "is-error");
            areaSelect.innerHTML = '<option value="">Enter pincode first</option>';
            return;
        }

        const postOffices = data[0].PostOffice;
        const first = postOffices[0];

        const state = first.State || "";
        const district = first.District || "";

        stateInput.value = state;
        cityInput.value = district;

        const areas = postOffices
            .map((po) => po.Name)
            .filter(Boolean);

        const uniqueAreas = [...new Set(areas)];

        areaSelect.innerHTML = '<option value="">Select area</option>';

        uniqueAreas.forEach((areaName) => {
            const opt = document.createElement("option");
            opt.value = areaName;
            opt.textContent = areaName;
            areaSelect.appendChild(opt);
        });

        areaSelect.disabled = false;

        showPincodeStatus(
            `Found ${uniqueAreas.length} area(s) in ${district}, ${state}.`,
            "is-success"
        );

    } catch (error) {
        console.error("Pincode fetch error:", error);

        showPincodeStatus("Unable to check pincode. Please try again.", "is-error");
        areaSelect.innerHTML = '<option value="">Enter pincode first</option>';
    }
};


const openAddressPopup = (address) => {
    const overlay = document.getElementById("delivery-address-popup-overlay");
    const title = document.getElementById("delivery-address-popup-title");
    const form = document.getElementById("delivery-address-popup-form");

    if (!overlay || !title || !form) return;

    showPopupMessage("");
    showPincodeStatus("");

    form.reset();

    const areaSelect = form.querySelector('[name="area"]');
    if (areaSelect) {
        areaSelect.innerHTML = '<option value="">Enter pincode first</option>';
        areaSelect.disabled = true;
    }

    if (address) {
        title.textContent = "Edit address";
        form.dataset.mode = "edit";
        form.dataset.addressId = address._id;

        const fields = ["fullName", "phone", "addressLine", "landmark", "city", "state", "pincode"];

        fields.forEach((field) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.value = address[field] || "";
            }
        });

        if (address.pincode && address.pincode.length === 6) {
            fetchPincodeDetails(address.pincode).then(() => {
                if (areaSelect && address.area) {
                    const match = [...areaSelect.options].find(
                        (opt) => opt.value === address.area
                    );
                    if (match) {
                        areaSelect.value = address.area;
                    }
                }
            });
        }

    } else {
        title.textContent = "Add new address";
        form.dataset.mode = "add";
        form.dataset.addressId = "";
    }

    overlay.hidden = false;
};


const closeAddressPopup = () => {
    const overlay = document.getElementById("delivery-address-popup-overlay");
    const form = document.getElementById("delivery-address-popup-form");

    if (overlay) overlay.hidden = true;
    if (form) form.reset();

    showPopupMessage("");
    showPincodeStatus("");
};


const loadSavedAddresses = async () => {

    const addressesContainer =
        document.getElementById("delivery-saved-addresses");

    const addressMessage =
        document.getElementById("delivery-address-message");

    const addButton =
        document.getElementById("delivery-add-address-button");

    if (!addressesContainer) {
        return;
    }

    const token = getAuthToken();

    if (!token) {
        addressesContainer.innerHTML = `
            <p class="delivery-address-loading">
                Please log in to use a saved address.
            </p>
        `;

        if (addButton) addButton.hidden = true;

        return;
    }

    try {

        const response = await fetch(ADDRESS_API, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load saved addresses."
            );
        }

        const addresses = Array.isArray(result.data) ? result.data : [];

        if (addButton) {
            addButton.hidden = addresses.length >= 3;
        }

        if (!addresses.length) {
            addressesContainer.innerHTML = `
                <p class="delivery-address-loading">
                    No saved addresses available. Tap + to add one.
                </p>
            `;
            return;
        }

        addressesContainer.innerHTML = "";

        addresses.forEach((address) => {

            const button = document.createElement("div");
            button.className = "delivery-address-card";

            const title = address.label
                ? address.label.charAt(0).toUpperCase() + address.label.slice(1)
                : "Saved Address";

            const addressText = [
                address.fullName,
                address.addressLine,
                address.landmark,
                address.area,
                address.city,
                address.state,
                address.pincode
            ]
                .filter(Boolean)
                .join(", ");

            button.innerHTML = `
                <p class="delivery-address-card-title">
                    ${title}
                </p>

                <p class="delivery-address-card-text">
                    ${addressText}
                </p>

                <span
                    class="delivery-address-edit-text-button"
                    role="button"
                    aria-label="Edit this address"
                    title="Edit this address"
                >Edit</span>
            `;

            const editButton = button.querySelector(".delivery-address-edit-text-button");

            if (editButton) {
                editButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    openAddressPopup(address);
                });
            }

            button.addEventListener("click", async () => {

                document
                    .querySelectorAll(".delivery-address-card")
                    .forEach((card) => {
                        card.classList.remove("is-selected");
                    });

                button.classList.add("is-selected");

                if (addressMessage) {
                    addressMessage.textContent = "Checking delivery availability...";
                    addressMessage.style.display = "block";
                    addressMessage.className = "delivery-address-message";
                }

                try {

                    const checkResponse = await fetch(ADDRESS_CHECK_API, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            addressId: address._id
                        })
                    });

                    const checkResult = await checkResponse.json();

                    if (!checkResponse.ok || !checkResult.success) {
                        throw new Error(
                            checkResult.message ||
                            "Unable to check this address."
                        );
                    }

                    const data = checkResult.data || {};

                    if (data.available === true) {

                        if (addressMessage) {
                            addressMessage.textContent =
                                "✅ Delivery available at this address.";
                            addressMessage.className =
                                "delivery-address-message is-available";
                        }

                        window.dispatchEvent(
                            new CustomEvent("deliveryAreaConfirmed", {
                                detail: {
                                    latitude: Number(data.latitude),
                                    longitude: Number(data.longitude),
                                    source: "address",
                                    isApproximate: false,
                                    distanceKm: Number(data.distanceKm) || null
                                }
                            })
                        );

                    } else {

                        if (addressMessage) {
                            addressMessage.textContent =
                                "❌ Delivery not available in this area.";
                            addressMessage.className =
                                "delivery-address-message is-unavailable";
                        }
                    }

                } catch (error) {

                    console.error("Saved address check error:", error);

                    if (addressMessage) {
                        addressMessage.textContent =
                            error.message ||
                            "Unable to check this address right now.";
                        addressMessage.className =
                            "delivery-address-message is-unavailable";
                    }
                }
            });

            addressesContainer.appendChild(button);
        });

    } catch (error) {

        console.error("Saved addresses error:", error);

        addressesContainer.innerHTML = `
            <p class="delivery-address-loading">
                Unable to load saved addresses.
            </p>
        `;

        if (addressMessage) {
            addressMessage.textContent = error.message;
            addressMessage.style.display = "block";
        }
    }
};


const setupAddressPopup = () => {

    const overlay = document.getElementById("delivery-address-popup-overlay");
    const closeButton = document.getElementById("delivery-address-popup-close");
    const cancelButton = document.getElementById("delivery-address-popup-cancel");
    const form = document.getElementById("delivery-address-popup-form");
    const addButton = document.getElementById("delivery-add-address-button");

    if (!overlay || !form) return;

    if (addButton) {
        addButton.addEventListener("click", () => {
            openAddressPopup(null);
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeAddressPopup);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeAddressPopup);
    }

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeAddressPopup();
        }
    });

    const pincodeInput = form.querySelector('[name="pincode"]');

    if (pincodeInput) {
        pincodeInput.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
        });

        pincodeInput.addEventListener("blur", () => {
            const value = pincodeInput.value.trim();

            if (value.length === 6) {
                fetchPincodeDetails(value);
            } else if (value.length > 0) {
                showPincodeStatus("Pincode must be 6 digits.", "is-error");
            }
        });

        pincodeInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                pincodeInput.blur();
            }
        });
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        showPopupMessage("");

        const mode = form.dataset.mode || "add";
        const addressId = form.dataset.addressId || "";

        const getValue = (name) => {
            const input = form.querySelector(`[name="${name}"]`);
            return input ? String(input.value || "").trim() : "";
        };

        const pincode = getValue("pincode");
        const state = getValue("state");
        const city = getValue("city");
        const area = getValue("area");
        const fullName = getValue("fullName");
        const phone = getValue("phone");
        const addressLine = getValue("addressLine");
        const landmark = getValue("landmark");

        if (pincode.length !== 6) {
            showPopupMessage("Pincode must be exactly 6 digits.");
            return;
        }

        if (!state || !city) {
            showPopupMessage("Please wait for pincode to load state and city.");
            return;
        }

        if (!area) {
            showPopupMessage("Please select an area.");
            return;
        }

        if (!fullName || !phone || !addressLine || !landmark) {
            showPopupMessage("Please fill all fields.");
            return;
        }

        const payload = {
            fullName,
            phone,
            addressLine,
            landmark,
            city,
            state,
            pincode,
            area
        };

        const token = getAuthToken();

        if (!token) {
            showPopupMessage("Please log in again.");
            return;
        }

        const saveButton = document.getElementById("delivery-address-popup-save");

        if (saveButton) saveButton.disabled = true;

        try {

            let response;

            if (mode === "edit" && addressId) {
                response = await fetch(`${ADDRESS_API}${addressId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(ADDRESS_API, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save address.");
            }

            closeAddressPopup();

            await loadSavedAddresses();

        } catch (error) {

            console.error("Save address error:", error);

            showPopupMessage(
                error.message || "Unable to save address."
            );

        } finally {
            if (saveButton) saveButton.disabled = false;
        }
    });
};


waitForAddressFallback(() => {
    setupAddressPopup();
    loadSavedAddresses();
});
