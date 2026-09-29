const loadCustomerProfile = async () => {
    const container = document.querySelector(
        "[data-customer-profile]"
    );

    if (!container) {
        return;
    }

    const authToken = localStorage.getItem(
        "authToken"
    );

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
            "http://localhost:5000/api/auth/me",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Failed to load customer profile."
            );
        }

        const user = result.data;

        container.innerHTML = `
            <section
                class="customer-profile"
                aria-labelledby="customer-profile-title"
            >
                <div class="profile-header">
                    <p class="profile-eyebrow">
                        Account
                    </p>

                    <h2 id="customer-profile-title">
                        My Profile
                    </h2>

                    <p class="profile-description">
                        View and manage your customer account information.
                    </p>
                </div>

                <div class="profile-details">
                    <div class="profile-detail">
                        <span class="profile-label">
                            Name
                        </span>

                        <strong>
                            ${user.name || "Not added"}
                        </strong>
                    </div>

                    <div class="profile-detail">
                        <span class="profile-label">
                            Email
                        </span>

                        <strong>
                            ${user.email || "Not added"}
                        </strong>
                    </div>

                    <div class="profile-detail">
                        <span class="profile-label">
                            Phone
                        </span>

                        <strong>
                            ${user.phone || "Not added"}
                        </strong>
                    </div>
                </div>
            </section>
        `;
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

loadCustomerProfile();
