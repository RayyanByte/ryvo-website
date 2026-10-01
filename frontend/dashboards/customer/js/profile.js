const PROFILE_API_URL =
    "http://localhost:5000/api/auth/me";

const loadCustomerProfile = async () => {
    const container = document.querySelector(
        "[data-customer-profile]"
    );

    if (!container) {
        return;
    }

    const authToken =
        localStorage.getItem("authToken");

    if (!authToken) {
        container.innerHTML = `
            <section class="customer-profile">
                <div class="profile-header">
                    <p class="profile-eyebrow">
                        Account
                    </p>

                    <h2>
                        My Profile
                    </h2>

                    <p class="profile-description">
                        Please sign in to view your profile.
                    </p>
                </div>
            </section>
        `;

        return;
    }

    try {
        const response = await fetch(
            PROFILE_API_URL,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${authToken}`
                }
            }
        );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Failed to load customer profile."
            );
        }

        renderCustomerProfile(
            result.data
        );
    } catch (error) {
        console.error(
            "Customer profile error:",
            error
        );

        container.innerHTML = `
            <section class="customer-profile">
                <div class="profile-header">
                    <p class="profile-eyebrow">
                        Account
                    </p>

                    <h2>
                        My Profile
                    </h2>

                    <p class="profile-description">
                        Unable to load customer information.
                    </p>
                </div>
            </section>
        `;
    }
};

const renderCustomerProfile = (user) => {
    const container = document.querySelector(
        "[data-customer-profile]"
    );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <section
            class="customer-profile"
            aria-labelledby="customer-profile-title"
        >
            <div class="profile-header">
                <div>
                    <p class="profile-eyebrow">
                        Account
                    </p>

                    <h2 id="customer-profile-title">
                        My Profile
                    </h2>
                </div>

                <button
                    type="button"
                    id="edit-profile-button"
                    class="profile-edit-button"
                >
                    Edit Profile
                </button>
            </div>

            <div
                id="profile-message"
                class="profile-message"
                aria-live="polite"
            ></div>

            <form
                id="customer-profile-form"
                class="profile-form"
            >
                <label class="profile-field">
                    <span>
                        Name
                    </span>

                    <input
                        type="text"
                        id="profile-name"
                        name="name"
                        value="${user.name || ""}"
                        maxlength="50"
                        required
                        disabled
                    >
                </label>

                <label class="profile-field">
                    <span>
                        Email
                    </span>

                    <input
                        type="email"
                        value="${user.email || ""}"
                        disabled
                    >

                    <small>
                        Email cannot be changed here.
                    </small>
                </label>

                <label class="profile-field">
                    <span>
                        Phone
                    </span>

                    <input
                        type="tel"
                        id="profile-phone"
                        name="phone"
                        value="${user.phone || ""}"
                        disabled
                    >
                </label>

                <div
                    id="profile-form-actions"
                    class="profile-form-actions"
                    hidden
                >
                    <button
                        type="button"
                        id="cancel-profile-button"
                        class="profile-cancel-button"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="profile-save-button"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </section>
    `;

    initializeProfileForm();
};

const initializeProfileForm = () => {
    const form = document.querySelector(
        "#customer-profile-form"
    );

    const editButton = document.querySelector(
        "#edit-profile-button"
    );

    const cancelButton = document.querySelector(
        "#cancel-profile-button"
    );

    const actions = document.querySelector(
        "#profile-form-actions"
    );

    const message = document.querySelector(
        "#profile-message"
    );

    const nameInput = document.querySelector(
        "#profile-name"
    );

    const phoneInput = document.querySelector(
        "#profile-phone"
    );

    if (
        !form ||
        !editButton ||
        !actions ||
        !message ||
        !nameInput ||
        !phoneInput
    ) {
        return;
    }

    editButton.addEventListener(
        "click",
        () => {
            nameInput.disabled = false;
            phoneInput.disabled = false;

            editButton.hidden = true;
            actions.hidden = false;

            message.textContent = "";

            nameInput.focus();
        }
    );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            () => {
                loadCustomerProfile();
            }
        );
    }

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const authToken =
                localStorage.getItem(
                    "authToken"
                );

            if (!authToken) {
                message.textContent =
                    "Please sign in first.";

                return;
            }

            const name =
                nameInput.value.trim();

            const phone =
                phoneInput.value.trim();

            if (!name) {
                message.textContent =
                    "Name is required.";

                nameInput.focus();

                return;
            }

            message.textContent =
                "Saving changes...";

            try {
                const response =
                    await fetch(
                        PROFILE_API_URL,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization:
                                    `Bearer ${authToken}`
                            },
                            body:
                                JSON.stringify({
                                    name,
                                    phone
                                })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Failed to update profile."
                    );
                }

                renderCustomerProfile(
                    result.data
                );
            } catch (error) {
                console.error(
                    "Profile update error:",
                    error
                );

                message.textContent =
                    error.message ||
                    "Unable to update profile.";
            }
        }
    );
};

loadCustomerProfile();
