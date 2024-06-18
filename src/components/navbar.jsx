const Navbar = ({ account, setAccount }) => {
  const handleMetaMaskConnection = async () => {
    if (account) {
      setAccount("");
    } else {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        console.log(
          "MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html"
        );
      }
    }
  };

  return (
    <div>
      <nav>
        <div className="nav__brand ">
          <h1>Dappazon</h1>
        </div>

        <input type="text" className="nav__search" />

        <button className={`nav__connect `} onClick={handleMetaMaskConnection}>
          <b>{account ? "Disconnect" : "Connect"}</b>
        </button>

        <ul className="nav__links">
          <li>
            <a href="#Clothing & Jewelry">Clothing & Jewelry</a>
          </li>
          <li>
            <a href="#Electronics & Gadgets">Electronics & Gadgets</a>
          </li>
          <li>
            <a href="#Toys & Gaming">Toys & Gaming</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
