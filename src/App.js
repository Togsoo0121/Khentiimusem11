import "./App.css";

export default function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="topbar">
          <div className="logo">Хэнтий музей</div>
          <div className="sublogo">Түүх • Соёл • Өв</div>
        </div>

        <nav className="navbar">
          <a href="#about">Музейн тухай</a>
          <a href="#visit">Зочлох</a>
          <a href="#halls">Танхимууд</a>
          <a href="#archive">Цахим сан</a>
          <a href="#events">Үзэсгэлэн</a>
          <a href="#training">Сургалт</a>
          <a href="#news">Мэдээ</a>
          <a href="#contact">Холбоо</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="overlay">
          <h1>Түүх, соёлын өвийг цахимаар амьдруулна</h1>
          <p>
            Хэнтий аймгийн музейн танхим, үзмэр, мэдээлэл, арга хэмжээ,
            сургалтын нэгдсэн цахим орчин.
          </p>
          <button>Дэлгэрэнгүй</button>
        </div>
      </section>

      {/* Sections */}
      <section id="about" className="section">
        <h2>Музейн тухай</h2>
        <p>
          Хэнтий аймгийн музей нь орон нутгийн түүх, археологи, угсаатны зүй,
          соёлын өвийг хадгалан хамгаалах, сурталчлах чиглэлээр ажилладаг.
        </p>
      </section>

      <section id="halls" className="cards">
        <div className="card">
          <h3>Түүхийн танхим</h3>
          <p>Аймгийн түүхэн хөгжил, баримт, үзмэрүүд.</p>
        </div>

        <div className="card">
          <h3>Эртний өв</h3>
          <p>Археологийн олдвор, эртний дурсгалууд.</p>
        </div>

        <div className="card">
          <h3>Угсаатны зүй</h3>
          <p>Ахуй соёл, уламжлал, хувцас хэрэглэл.</p>
        </div>
      </section>

      <section id="news" className="section dark">
        <h2>Сүүлийн мэдээ</h2>
        <p>
          Шинэ үзэсгэлэн, арга хэмжээ, сургалтын мэдээлэл удахгүй нэмэгдэнэ.
        </p>
      </section>

      <footer id="contact" className="footer">
        <h3>Холбоо барих</h3>
        <p>Хэнтий аймаг, Чингис хот</p>
        <p>Утас: 0000-0000</p>
        <p>Email: museum@khentii.mn</p>
      </footer>
    </div>
  );
}
