(() => {

    let categories = [];

    const $ = (id) =>
        document.getElementById(id);

    const esc = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    const message = (
        text,
        type = "info"
    ) => {
        const element =
            $("categoryDashboardMessage");

        if (!element) {
            return;
        }

        element.textContent = text;
        element.dataset.type = type;
    };

    const render = () => {

        const list =
            $("categoryList");

        if (!categories.length) {
            list.innerHTML =
                "<p>No categories found.</p>";

            return;
        }

        list.innerHTML =
            categories.map(
                (category) => `
                    <article class="admin-card">

                        ${
                            category.image
                                ? `
                                    <img
                                        src="${esc(
                                            category.image
                                        )}"
                                        alt="${esc(
                                            category.name
                                        )}"
                                        class="admin-card-image"
                                    >
                                  `
                                : ""
                        }

                        <div class="admin-card-body">

                            <h3>
                                ${esc(category.name)}
                            </h3>

                            <p>
                                ${esc(
                                    category.description
                                )}
                            </p>

                            <p>
                                ${
                                    category.isActive
                                        ? "Active"
                                        : "Inactive"
                                }
                            </p>

                            <button
                                type="button"
                                class="admin-secondary-button"
                                data-edit-category="${esc(
                                    category._id
                                )}"
                            >
                                Edit
                            </button>

                            ${
                                category.isActive
                                    ? `
                                        <button
                                            type="button"
                                            class="admin-danger-button"
                                            data-delete-category="${esc(
                                                category._id
                                            )}"
                                        >
                                            Deactivate
                                        </button>
                                      `
                                    : ""
                            }

                        </div>

                    </article>
                `
            ).join("");
    };

    const load = async () => {

        const result =
            await categoryAdminApi
                .getCategories();

        if (!result.success) {
            message(
                result.message ||
                    "Unable to load categories.",
                "error"
            );

            return;
        }

        categories =
            Array.isArray(result.data)
                ? result.data
                : [];

        render();
    };

    const resetForm = () => {

        $("categoryForm").reset();

        $("categoryId").value = "";

        $("categoryActive").checked =
            true;
    };

    const openEdit = (category) => {

        $("categoryId").value =
            category._id;

        $("categoryName").value =
            category.name || "";

        $("categoryDescription").value =
            category.description || "";

        $("categoryImage").value =
            category.image || "";

        $("categoryActive").checked =
            Boolean(category.isActive);

        $("categoryFormContainer")
            .hidden = false;
    };

    const save = async (event) => {

        event.preventDefault();

        const categoryId =
            $("categoryId").value;

        const payload = {

            name:
                $("categoryName")
                    .value
                    .trim(),

            description:
                $("categoryDescription")
                    .value
                    .trim(),

            image:
                $("categoryImage")
                    .value
                    .trim(),

            isActive:
                $("categoryActive")
                    .checked
        };

        const result =
            categoryId
                ? await categoryAdminApi
                    .updateCategory(
                        categoryId,
                        payload
                    )
                : await categoryAdminApi
                    .createCategory(
                        payload
                    );

        if (!result.success) {
            message(
                result.message ||
                    "Unable to save category.",
                "error"
            );

            return;
        }

        $("categoryFormContainer")
            .hidden = true;

        message(
            result.message ||
                "Category saved successfully.",
            "success"
        );

        await load();
    };

    const handleClick = async (
        event
    ) => {

        const edit =
            event.target.closest(
                "[data-edit-category]"
            );

        if (edit) {

            const category =
                categories.find(
                    (item) =>
                        String(item._id) ===
                        String(
                            edit.dataset
                                .editCategory
                        )
                );

            if (category) {
                openEdit(category);
            }

            return;
        }

        const remove =
            event.target.closest(
                "[data-delete-category]"
            );

        if (!remove) {
            return;
        }

        const result =
            await categoryAdminApi
                .deleteCategory(
                    remove.dataset
                        .deleteCategory
                );

        if (!result.success) {
            message(
                result.message ||
                    "Unable to deactivate category.",
                "error"
            );

            return;
        }

        message(
            result.message ||
                "Category deactivated successfully.",
            "success"
        );

        await load();
    };

    const init = async () => {

        $("addCategoryButton")
            .addEventListener(
                "click",
                () => {
                    resetForm();

                    $("categoryFormContainer")
                        .hidden = false;
                }
            );

        $("cancelCategoryButton")
            .addEventListener(
                "click",
                () => {
                    $("categoryFormContainer")
                        .hidden = true;
                }
            );

        $("categoryForm")
            .addEventListener(
                "submit",
                save
            );

        $("categoryList")
            .addEventListener(
                "click",
                handleClick
            );

        await load();
    };

    window.initCategoryDashboard =
        init;

})();
