const ORDER_ITEM_STORAGE_KEY =
    "ryvo_selected_order_item";


const ORDER_LOCATION_PAGE =
    "../../delivery/pages/order-location.html";


let selectedOrderItem = null;


const saveOrderItemToStorage = (
    orderItem
) => {

    try {

        sessionStorage.setItem(
            ORDER_ITEM_STORAGE_KEY,
            JSON.stringify(orderItem)
        );

        return true;

    } catch (error) {

        console.error(
            "Order item storage error:",
            error
        );

        return false;
    }
};


const loadOrderItemFromStorage = () => {

    try {

        const storedItem =
            sessionStorage.getItem(
                ORDER_ITEM_STORAGE_KEY
            );


        if (!storedItem) {
            return null;
        }


        const parsedItem =
            JSON.parse(storedItem);


        if (
            !parsedItem ||
            !parsedItem.foodId ||
            !parsedItem.name ||
            !Number.isFinite(
                Number(parsedItem.price)
            ) ||
            !Number.isInteger(
                Number(parsedItem.quantity)
            ) ||
            Number(parsedItem.quantity) < 1
        ) {

            sessionStorage.removeItem(
                ORDER_ITEM_STORAGE_KEY
            );

            return null;
        }


        return {
            foodId:
                parsedItem.foodId,

            name:
                parsedItem.name,

            price:
                Number(parsedItem.price),

            quantity:
                Number(parsedItem.quantity)
        };

    } catch (error) {

        console.error(
            "Order item storage read error:",
            error
        );

        return null;
    }
};


const setSelectedOrderItem = (
    foodId,
    name,
    price
) => {

    if (
        !foodId ||
        !name ||
        !Number.isFinite(
            Number(price)
        )
    ) {

        console.error(
            "Order button: invalid food data."
        );

        return false;
    }


    selectedOrderItem = {
        foodId,
        name,
        price: Number(price),
        quantity: 1
    };


    const saved =
        saveOrderItemToStorage(
            selectedOrderItem
        );


    if (!saved) {
        return false;
    }


    window.selectedOrderItem = {
        ...selectedOrderItem
    };


    window.dispatchEvent(
        new CustomEvent(
            "orderItemSelected",
            {
                detail: {
                    ...selectedOrderItem
                }
            }
        )
    );


    return true;
};


const getSelectedOrderItem = () => {

    if (selectedOrderItem) {

        return {
            ...selectedOrderItem
        };
    }


    const storedItem =
        loadOrderItemFromStorage();


    if (!storedItem) {
        return null;
    }


    selectedOrderItem =
        storedItem;


    window.selectedOrderItem = {
        ...storedItem
    };


    return {
        ...storedItem
    };
};


const clearSelectedOrderItem = () => {

    selectedOrderItem = null;

    window.selectedOrderItem = null;


    try {

        sessionStorage.removeItem(
            ORDER_ITEM_STORAGE_KEY
        );

    } catch (error) {

        console.error(
            "Order item storage clear error:",
            error
        );
    }


    window.dispatchEvent(
        new CustomEvent(
            "orderItemCleared"
        )
    );
};


const openOrderLocation = () => {

    if (!localStorage.getItem("authToken")) {
        window.location.href = "/auth/pages/login.html";
        return false;
    }

    const orderItem =
        getSelectedOrderItem();


    if (!orderItem) {

        console.error(
            "Order location: no food item selected."
        );

        return false;
    }


    window.location.href =
        ORDER_LOCATION_PAGE;


    return true;
};


window.setSelectedOrderItem =
    setSelectedOrderItem;

window.getSelectedOrderItem =
    getSelectedOrderItem;

window.clearSelectedOrderItem =
    clearSelectedOrderItem;

window.openOrderLocation =
    openOrderLocation;
