const initFoodDashboard = async () => {

    const container =
        document.getElementById("food-admin-list");

    if (!container) {
        return;
    }

    const form =
        document.getElementById("food-form");

    const categorySelect =
        document.getElementById("food-category");

    try {

        const result =
            await foodAdminApi.getFoods();

        const foods =
            result?.data ||
            result?.foods ||
            [];

        container.innerHTML =
            foods.length
                ? foods.map(
                    (food) => `
                        <article class="food-card">

                            <h3>
                                ${food.name || "-"}
                            </h3>

                            <p>
                                Price: ₹${food.price ?? "-"}
                            </p>

                            <p>
                                Category:
                                ${food.category?.name || "-"}
                            </p>

                            <p>
                                Available:
                                ${food.isAvailable ? "Yes" : "No"}
                            </p>

                            <p>
                                Active:
                                ${food.isActive ? "Yes" : "No"}
                            </p>

                        </article>
                    `
                ).join("")
                : "<p>No foods found.</p>";

        if (categorySelect) {

            const categories =
                await foodAdminApi.getCategories();

            const list =
                categories?.data ||
                categories?.categories ||
                [];

            categorySelect.innerHTML =
                `<option value="">Select category</option>` +
                list.map(
                    (category) => `
                        <option value="${category._id}">
                            ${category.name}
                        </option>
                    `
                ).join("");
        }

        if (form) {
            form.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();

                    const payload = {
                        name:
                            document.getElementById(
                                "food-name"
                            )?.value.trim(),

                        price:
                            Number(
                                document.getElementById(
                                    "food-price"
                                )?.value
                            ),

                        category:
                            categorySelect?.value,

                        image:
                            document.getElementById(
                                "food-image"
                            )?.value.trim(),

                        description:
                            document.getElementById(
                                "food-description"
                            )?.value.trim(),

                        isAvailable:
                            document.getElementById(
                                "food-available"
                            )?.checked,

                        isActive:
                            document.getElementById(
                                "food-active"
                            )?.checked
                    };

                    await foodAdminApi.createFood(
                        payload
                    );

                    form.reset();

                    initFoodDashboard();
                }
            );
        }

    } catch (error) {

        container.innerHTML =
            `<p>${error.message}</p>`;
    }
};


window.initFoodDashboard =
    initFoodDashboard;
