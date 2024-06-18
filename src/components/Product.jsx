import React, { useState } from "react";
import { ethers } from "ethers"; // Import ethers library
import Rating from "./Rating";
import { Popup } from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setOrder] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [purchaseTimes, setPurchaseTimes] = useState([]); // State variable to store array of purchase times
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [showOutOfStockPopup, setShowOutOfStockPopup] = useState(false);

  const fetchOrderDetails = async () => {
    const events = await dappazon.queryFilter("Buy");
    const orders = events.filter(
      (event) =>
        event.args.buyer === account &&
        event.args.itemId.toString() === item.id.toString()
    );

    if (orders.length === 0) return;

    const order = await dappazon.orders(account, orders[0].args.orderId);
    setOrder(order);
  };

  const buyHandler = async () => {
    try {
      // Check if account is defined
      if (!account) {
        setShowAccountPopup(true);
        return;
      }

      // Check if item is in stock
      if (item.stock <= 0) {
        setShowOutOfStockPopup(true);
        return;
      }

      const signer = await provider.getSigner();

      // Buy item...
      let transaction = await dappazon
        .connect(signer)
        .buy(item.id, { value: item.cost });
      await transaction.wait();

      // Fetch and update order details immediately after purchase
      await fetchOrderDetails();
      setHasBought(true);

      // Update purchase times array with new purchase time
      const currentTimestamp = Math.floor(Date.now() / 1000); // Get current Unix timestamp
      setPurchaseTimes([...purchaseTimes, currentTimestamp]);
    } catch (error) {
      console.error("Error buying item:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleClose = () => {
    togglePop();
  };

  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image">
          <img src={item.image} alt="Product" />
        </div>
        <div className="product__overview">
          <h1>{item.name}</h1>

          <Rating value={item.rating} />

          <hr />

          <p>{item.address}</p>

          <h2>{ethers.formatUnits(item.cost.toString(), "ether")} ETH</h2>

          <hr />

          <h2>Overview</h2>

          <p>
            {item.description}
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima rem,
            iusto, consectetur inventore quod soluta quos qui assumenda aperiam,
            eveniet doloribus commodi error modi eaque! Iure repudiandae
            temporibus ex? Optio!
          </p>
        </div>

        <div className="product__order">
          <h1>{ethers.formatUnits(item.cost.toString(), "ether")} ETH</h1>

          <p>
            FREE delivery <br />
            <strong>
              {new Date(Date.now() + 345600000).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </p>

          {item.stock > 0 ? <p>In Stock.</p> : <p>Out of Stock.</p>}

          <button className="product__buy" onClick={buyHandler}>
            Buy Now
          </button>

          <p>
            <small>Ships from</small> Dappazon
          </p>
          <p>
            <small>Sold by</small> Dappazon
          </p>
          {purchaseTimes.map((timestamp, index) => (
            <div key={index} className="product__bought mb-1">
              Item bought on <br />
              <strong>
                {new Date(Number(timestamp + "000")).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                  }
                )}
              </strong>
            </div>
          ))}
        </div>

        <button onClick={handleClose} className="product__close">
          <img src="/close.svg" alt="Close" />
        </button>
      </div>

      {/* Popup for account not detected */}
      <Popup open={showAccountPopup} onClose={() => setShowAccountPopup(false)}>
        <div className="popup">
          <h2>User account not detected</h2> <br></br>
          <h5>Please connect your account to proceed.</h5>
          <br></br>
        </div>
      </Popup>

      {/* Popup for out of stock */}
      <Popup
        open={showOutOfStockPopup}
        onClose={() => setShowOutOfStockPopup(false)}
      >
        <div className="popup">
          <h2>Item out of stock</h2> <br></br>
          <h5>Sorry, this item is currently out of stock.</h5>
          <br></br>
        </div>
      </Popup>
    </div>
  );
};

export default Product;
