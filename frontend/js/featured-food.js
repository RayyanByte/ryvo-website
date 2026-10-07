const FEATURED_FOOD_API_URL =
    "http://localhost:5000/api/foods/";


const escapeFeaturedFoodHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};


const openFeaturedFoodDetails = (food) => {
    let modal =
        document.getElementById(
            "featured-food-details"
        );

    if (!modal) {
        modal = document.createElement("div");

        modal.id =
            "featured-food-details";

        modal.className =
            "featured-food-details";

        modal.hidden = true;

        modal.innerHTML = `
            <div
                class="featured-food-details-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="featured-food-details-title"
            >
                <div class="featured-food-details-header">
                    <h2 id="featured-food-details-title"></h2>

                    <button
                        type="button"
                        class="featured-food-details-close"
                        aria-label="Close food details"
                    >
                        ×
                    </button>
                </div>

                <div
                    class="featured-food-details-body"
                    id="featured-food-details-body"
                ></div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener(
            "click",
            (event) => {
                if (
                    event.target === modal ||
                    event.target.closest(
                        ".featured-food-details-close"
                    )
                ) {
                    modal.hidden = true;
                }
            }
        );
    }

    const title =
        document.getElementById(
            "featured-food-details-title"
        );

    const body =
        document.getElementById(
            "featured-food-details-body"
        );

    if (!title || !body) {
        return;
    }

    const images =
        Array.isArray(food.media?.images)
            ? food.media.images.filter(
                (image) =>
                    typeof image === "string" &&
                    image.trim()
            )
            : [];

    const video =
        typeof food.media?.video === "string"
            ? food.media.video.trim()
            : "";

    const mediaHtml =
        images.length || video
            ? `
                ${
                    images.map(
                        (image) => `
                            <img
                                src="${escapeFeaturedFoodHtml(image)}"
                                alt="${escapeFeaturedFoodHtml(food.name)}"
                                loading="lazy"
                            >
                        `
                    ).join("")
                }

                ${
                    video
                        ? `
                            <video
                                src="${escapeFeaturedFoodHtml(video)}"
                                controls
                                preload="metadata"
                            ></video>
                        `
                        : ""
                }
            `
            : `
                <div class="featured-food-details-placeholder">
                    No photos or video available for this dish.
                </div>
            `;

    title.textContent =
        food.name || "Food Details";

    body.innerHTML = `
        <div class="featured-food-details-media">
            ${mediaHtml}
        </div>

        <div class="featured-food-details-category">
            ${
                escapeFeaturedFoodHtml(
                    food.category?.name || "Food"
                )
            }
        </div>

        <p class="featured-food-details-description">
            ${
                escapeFeaturedFoodHtml(
                    food.description ||
                    "No description available."
                )
            }
        </p>

        <div class="featured-food-details-price">
            ₹${Number(food.price || 0).toFixed(2)}
        </div>

        <button
            type="button"
            class="featured-food-details-order"
            data-food-id="${escapeFeaturedFoodHtml(food._id)}"
            data-food-name="${escapeFeaturedFoodHtml(food.name)}"
            data-food-price="${Number(food.price || 0)}"
        >
            Order Now
        </button>
    `;

    const orderButton =
        body.querySelector(
            ".featured-food-details-order"
        );

    orderButton?.addEventListener(
        "click",
        () => {
            const token =
                localStorage.getItem("authToken");

            if (!token) {
                window.location.href =
                    "/auth/pages/login.html";

                return;
            }

            sessionStorage.setItem(
                "ryvo_selected_order_item",
                JSON.stringify({
                    foodId: food._id,
                    name: food.name,
                    price: Number(food.price || 0),
                    quantity: 1
                })
            );

            window.location.href =
                "/delivery/pages/order-location.html";
        }
    );

    modal.hidden = false;
};


const renderFeaturedFoods = (foods) => {
    const grid =
        document.querySelector(
            ".featured-food-grid"
        );

    if (!grid) {
        return;
    }

    if (!foods.length) {
        grid.innerHTML = `
            <p>
                No featured food available.
            </p>
        `;

        return;
    }

    grid.innerHTML =
        foods.slice(0, 6).map(
            (food) => `
                <article
                    class="food-card"
                    data-featured-food-id="${escapeFeaturedFoodHtml(food._id)}"
                >
                    <div class="food-card-image">
                        ${
                            food.media?.images?.[0]
                                ? `
                                    <img
                                        src="${escapeFeaturedFoodHtml(food.media.images[0])}"
                                        alt="${escapeFeaturedFoodHtml(food.name)}"
                                        style="width:100%;height:100%;min-height:220px;object-fit:cover;"
                                    >
                                `
                                : `
                                    <span>Food Image</span>
                                `
                        }
                    </div>

                    <div class="food-card-content">
                        <h3 class="food-card-title">
                            ${escapeFeaturedFoodHtml(food.name)}
                        </h3>

                        <p class="food-card-description">
                            ${escapeFeaturedFoodHtml(food.description)}
                        </p>

                        <div class="food-card-footer">
                            <span class="food-card-price">
                                ₹${Number(food.price || 0).toFixed(2)}
                            </span>

                            <button
                                type="button"
                                class="food-card-button"
                                data-featured-order
                            >
                                Order
                            </button>
                        </div>
                    </div>
                </article>
            `
        ).join("");

    grid.querySelectorAll(
        ".food-card"
    ).forEach(
        (card, index) => {
            const food = foods.slice(0, 6)[index];

            card.addEventListener(
                "click",
                (event) => {
                    if (
                        event.target.closest(
                            "[data-featured-order]"
                        )
                    ) {
                        return;
                    }

                    openFeaturedFoodDetails(
                        food
                    );
                }
            );

            const orderButton =
                card.querySelector(
                    "[data-featured-order]"
                );

            orderButton?.addEventListener(
                "click",
                () => {
                    const token =
                        localStorage.getItem(
                            "authToken"
                        );

                    if (!token) {
                        window.location.href =
                            "/auth/pages/login.html";

                        return;
                    }

                    sessionStorage.setItem(
                        "ryvo_selected_order_item",
                        JSON.stringify({
                            foodId: food._id,
                            name: food.name,
                            price: Number(food.price || 0),
                            quantity: 1
                        })
                    );

                    window.location.href =
                        "/delivery/pages/order-location.html";
                }
            );
        }
    );
};


const loadFeaturedFoods = async () => {
    try {
        const response =
            await fetch(
                FEATURED_FOOD_API_URL
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Could not load featured food."
            );
        }

        renderFeaturedFoods(
            result.data || []
        );
    } catch (error) {
        console.error(
            "Featured food loading error:",
            error
        );
    }
};


const startFeaturedFoodLoader = () => {
    const grid =
        document.querySelector(
            ".featured-food-grid"
        );

    if (!grid) {
        return;
    }

    loadFeaturedFoods();
};


window.addEventListener(
    "featured-food-ready",
    startFeaturedFoodLoader
);
