import eruSymbol from "../../assets/eru-symbol.png";

function SplashScreen({ fading = false }) {
  return (
    <main className={fading ? "splash-screen fading" : "splash-screen"}>
      <img src={eruSymbol} alt="eru" className="splash-symbol" />
    </main>
  );
}

export default SplashScreen;
