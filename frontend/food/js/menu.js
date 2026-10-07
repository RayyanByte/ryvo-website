const CATEGORY_API_URL =
    "http://localhost:5000/api/categories/";

const FOOD_API_URL =
    "http://localhost:5000/api/foods/";

let selectedCategoryId = "";


async function loadCategories() {

    const categoryList =
        document.getElementById(
            "food-category-list"
        );


    if (!categoryList) {
        return;
    }


    categoryList.innerHTML = `
        <p class="food-menu-loading">
            Loading categories...
        </p>
    `;


    try {

        const response =
            await fetch(
                CATEGORY_API_URL
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Could not load categories."
            );
        }


        renderCategories(
            result.data || []
        );

    } catch (error) {

        console.error(
            "Category loading error:",
            error
        );


        categoryList.innerHTML = `
            <p class="food-menu-error">
                Unable to load categories.
            </p>
        `;
    }
}


function renderCategories(
    categories
) {

    const categoryList =
        document.getElementById(
            "food-category-list"
        );


    if (!categoryList) {
        return;
    }


    if (!categories.length) {

        categoryList.innerHTML = `
            <p class="food-menu-empty">
                No categories available.
            </p>
        `;

        return;
    }


    categoryList.innerHTML = `
        <button
            type="button"
            class="food-category-button active"
            data-category-id=""
        >
            All
        </button>
    `;


    categoryList.innerHTML +=
        categories.map(
            (category) => `
                <button
                    type="button"
                    class="food-category-button"
                    data-category-id="${category._id}"
                >
                    ${category.name}
                </button>
            `
        ).join("");


    categoryList
        .querySelectorAll(
            ".food-category-button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const categoryId =
                            button.dataset.categoryId ||
                            "";


                        selectedCategoryId =
                            categoryId;


                        updateActiveCategoryButton(
                            button
                        );


                        loadFoods(
                            selectedCategoryId
                        );
                    }
                );
            }
        );
}


function updateActiveCategoryButton(
    activeButton
) {

    const buttons =
        document.querySelectorAll(
            ".food-category-button"
        );


    buttons.forEach(
        (button) => {

            button.classList.remove(
                "active"
            );
        }
    );


    activeButton.classList.add(
        "active"
    );
}


async function loadFoods(
    categoryId = ""
) {

    const foodList =
        document.getElementById(
            "food-list"
        );


    if (!foodList) {
        return;
    }


    foodList.innerHTML = `
        <p class="food-menu-loading">
            Loading food...
        </p>
    `;


    try {

        const requestUrl =
            categoryId
                ? `${FOOD_API_URL}?category=${encodeURIComponent(categoryId)}`
                : FOOD_API_URL;


        const response =
            await fetch(
                requestUrl
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Could not load food."
            );
        }


        renderFoods(
            result.data || []
        );

    } catch (error) {

        console.error(
            "Food loading error:",
            error
        );


        foodList.innerHTML = `
            <p class="food-menu-error">
                Unable to load food.
            </p>
        `;
    }
}


function renderFoods(
    foods
) {

    const foodList =
        document.getElementById(
            "food-list"
        );


    if (!foodList) {
        return;
    }


    if (!foods.length) {

        foodList.innerHTML = `
            <p class="food-menu-empty">
                No food available in this category.
            </p>
        `;

        return;
    }


    foodList.innerHTML =
        foods.map(
            (food) => {

                const isAvailable =
                    Boolean(
                        food.isAvailable
                    );


                return `
                    <article
                        class="food-card"
                        data-food-id="${food._id}"
                    >

                        <div class="food-card-media">

                            ${
                                food.media &&
                                food.media.images &&
                                food.media.images.length
                                    ? `
                                        <img
                                            src="${food.media.images[0]}"
                                            alt="${food.name}"
                                            class="food-card-image"
                                        >
                                    `
                                    : `
                                        <div class="food-card-placeholder">
                                            Food Image
                                        </div>
                                    `
                            }

                        </div>


                        <div class="food-card-content">

                            <div class="food-card-category">
                                ${
                                    food.category &&
                                    food.category.name
                                        ? food.category.name
                                        : "Food"
                                }
                            </div>


                            <h3 class="food-card-title">
                                ${food.name}
                            </h3>


                            ${
                                food.description
                                    ? `
                                        <p class="food-card-description">
                                            ${food.description}
                                        </p>
                                    `
                                    : ""
                            }


                            <div class="food-card-footer">

                                <strong
                                    class="food-card-price"
                                >
                                    ₹${food.price}
                                </strong>


                                <span
                                    class="food-card-status ${
                                        isAvailable
                                            ? ""
                                            : "unavailable"
                                    }"
                                >
                                    ${
                                        isAvailable
                                            ? "Available"
                                            : "Unavailable"
                                    }
                                </span>

                            </div>


                            <button
                                type="button"
                                class="food-order-button"
                                data-food-id="${food._id}"
                                data-food-name="${String(
                                    food.name
                                ).replace(
                                    /"/g,
                                    "&quot;"
                                )}"
                                data-food-price="${food.price}"
                                ${
                                    isAvailable
                                        ? ""
                                        : "disabled"
                                }
                            >
                                ${
                                    isAvailable
                                        ? "Order Now"
                                        : "Unavailable"
                                }
                            </button>

                        </div>

                    </article>
                `;
            }
        ).join("");


    setupOrderButtons();
}


function setupOrderButtons() {

    const orderButtons =
        document.querySelectorAll(
            ".food-order-button"
        );


    orderButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        button.disabled
                    ) {
                        return;
                    }


                    if (
                        typeof window
                            .setSelectedOrderItem !==
                        "function"
                    ) {

                        console.error(
                            "Order button module is not available."
                        );

                        return;
                    }


                    const foodId =
                        button.dataset.foodId;

                    const foodName =
                        button.dataset.foodName;

                    const foodPrice =
                        Number(
                            button.dataset.foodPrice
                        );


                    const saved =
                        window.setSelectedOrderItem(
                            foodId,
                            foodName,
                            foodPrice
                        );


                    if (!saved) {
                        return;
                    }


                    console.log(
                        "Order item selected:",
                        window.getSelectedOrderItem()
                    );


                    if (
                        typeof window.openOrderLocation !==
                        "function"
                    ) {

                        console.error(
                            "Order location module is not available."
                        );

                        return;
                    }


                    window.openOrderLocation();
                }
            );
        }
    );
}


if (!localStorage.getItem("authToken")) {
    window.location.replace("/auth/pages/login.html");
} else {
    loadCategories();
    loadFoods();
}
