(() => {

    const $ = (id) =>
        document.getElementById(id);

    const message = (
        text,
        type = "info"
    ) => {
        const element =
            $("shopDashboardMessage");

        element.textContent = text;
        element.dataset.type = type;
    };

    const load = async () => {

        const result =
            await shopAdminApi.getStatus();

        if (!result.success) {
            message(
                result.message ||
                    "Unable to load shop settings.",
                "error"
            );

            return;
        }

        const shop =
            result.data;

        $("shopOpen").checked =
            Boolean(shop.isOpen);

        $("shopMessage").value =
            shop.statusMessage || "";

        $("shopLatitude").value =
            shop.location?.latitude ?? "";

        $("shopLongitude").value =
            shop.location?.longitude ?? "";

        $("shopRadius").value =
            shop.deliveryRadiusKm ?? "";
    };

    const save = async (
        event
    ) => {

        event.preventDefault();

        const payload = {

            isOpen:
                $("shopOpen").checked,

            statusMessage:
                $("shopMessage")
                    .value
                    .trim(),

            location: {
                latitude:
                    Number(
                        $("shopLatitude")
                            .value
                    ),

                longitude:
                    Number(
                        $("shopLongitude")
                            .value
                    )
            },

            deliveryRadiusKm:
                Number(
                    $("shopRadius")
                        .value
                )
        };

        const result =
            await shopAdminApi.update(
                payload
            );

        if (!result.success) {
            message(
                result.message ||
                    "Unable to update shop settings.",
                "error"
            );

            return;
        }

        message(
            result.message ||
                "Shop settings updated.",
            "success"
        );
    };

    const init = async () => {

        $("shopForm")
            .addEventListener(
                "submit",
                save
            );

        await load();
    };

    window.initShopDashboard =
        init;

})();
