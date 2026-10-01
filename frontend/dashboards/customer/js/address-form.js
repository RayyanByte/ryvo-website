const ADDRESS_API_URL = "http://localhost:5000/api/addresses/";

const initializeAddressForm = () => {
    const addressesContainer = document.querySelector(
        "[data-customer-addresses]"
    );

    if (!addressesContainer) {
        return;
    }

    const addAddressButton =
        addressesContainer.querySelector("#add-address-button");

    const formContainer =
        addressesContainer.querySelector("#address-form-container");

    if (!addAddressButton || !formContainer) {
        return;
    }

    if (addAddressButton.dataset.initialized === "true") {
        return;
    }

    addAddressButton.dataset.initialized = "true";

    const addressForm =
        formContainer.querySelector("#address-form");

    const message =
        formContainer.querySelector("#address-form-message");

    const cancelButton =
        formContainer.querySelector("#cancel-address-button");

    if (!addressForm || !message) {
        return;
    }

    let editingAddressId = null;

    const showForm = () => {
        formContainer.hidden = false;
        addAddressButton.hidden = true;
    };

    const hideForm = () => {
        formContainer.hidden = true;
        addAddressButton.hidden = false;
        editingAddressId = null;
    };

    const getAddressData = () => {
        const formData = new FormData(addressForm);

        return {
            label: formData.get("label").trim(),
            fullName: formData.get("fullName").trim(),
            phone: formData.get("phone").trim(),
            addressLine: formData.get("addressLine").trim(),
            landmark: formData.get("landmark").trim(),
            city: formData.get("city").trim(),
            state: formData.get("state").trim(),
            pincode: formData.get("pincode").trim()
        };
    };

    const fillAddressForm = (address) => {
        const fields = {
            "#address-label": address.label || "",
            "#address-full-name": address.fullName || "",
            "#address-phone": address.phone || "",
            "#address-line": address.addressLine || "",
            "#address-landmark": address.landmark || "",
            "#address-city": address.city || "",
            "#address-state": address.state || "",
            "#address-pincode": address.pincode || ""
        };

        Object.entries(fields).forEach(([selector, value]) => {
            const field = addressForm.querySelector(selector);

            if (field) {
                field.value = value;
            }
        });
    };

    addAddressButton.addEventListener("click", () => {
        editingAddressId = null;

        addressForm.reset();
        message.textContent = "";

        showForm();

        const firstField =
            formContainer.querySelector("#address-label");

        if (firstField) {
            firstField.focus();
        }
    });

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            addressForm.reset();
            message.textContent = "";
            hideForm();
        });
    }

    window.addEventListener("editCustomerAddress", (event) => {
        const address = event.detail;

        if (!address || !address._id) {
            return;
        }

        editingAddressId = address._id;

        fillAddressForm(address);

        showForm();

        message.textContent = "Editing saved address.";

        const firstField =
            formContainer.querySelector("#address-label");

        if (firstField) {
            firstField.focus();
        }
    });

    addressForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            message.textContent = "Please sign in first.";
            return;
        }

        const addressData = getAddressData();

        const isEditing = Boolean(editingAddressId);

        message.textContent = isEditing
            ? "Updating address..."
            : "Saving address...";

        try {
            const requestUrl = isEditing
                ? `${ADDRESS_API_URL}${editingAddressId}`
                : ADDRESS_API_URL;

            const response = await fetch(requestUrl, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify(addressData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    (isEditing
                        ? "Failed to update address."
                        : "Failed to save address.")
                );
            }

            message.textContent = isEditing
                ? "Address updated successfully."
                : "Address saved successfully.";

            addressForm.reset();

            hideForm();

            window.dispatchEvent(
                new CustomEvent("customerAddressSaved")
            );
        } catch (error) {
            console.error(
                isEditing
                    ? "Update address error:"
                    : "Save address error:",
                error
            );

            message.textContent =
                error.message ||
                (isEditing
                    ? "Unable to update address."
                    : "Unable to save address.");
        }
    });
};

const loadAddressForm = async () => {
    const addressesContainer = document.querySelector(
        "[data-customer-addresses]"
    );

    if (!addressesContainer) {
        return;
    }

    try {
        const response = await fetch(
            "../components/address-form.html"
        );

        if (!response.ok) {
            throw new Error(
                `Address form request failed: ${response.status}`
            );
        }

        const formHtml = await response.text();

        const formContainer =
            document.createElement("div");

        formContainer.id = "address-form-container";
        formContainer.hidden = true;
        formContainer.innerHTML = formHtml;

        addressesContainer.appendChild(formContainer);

        initializeAddressForm();
    } catch (error) {
        console.error(
            "Address form component error:",
            error
        );
    }
};

loadAddressForm();
