import React, { useEffect, useState } from "react";
import "./App.css";
import { db, auth } from "./firebase";
import { ref, set, onValue } from "firebase/database";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const CLOUD_NAME = "dsg5ey8do";
const UPLOAD_PRESET = "museum_upload";

const defaultData = {
  museumName: "Хэнтий музей",
  slogan: "Түүх • Соёл • Өв",
  heroTitle: "Түүх, соёлын өвийг цахимаар амьдруулна",
  heroText:
    "Музейн танхим, үзмэр, мэдээ, сургалт, арга хэмжээний мэдээллийг нэг дор.",
  heroImage: "https://ncch.gov.mn/Images/Museum/23/photo.jpg",
  about:
    "Хэнтий аймгийн музей нь түүх, археологи, угсаатны зүй, соёлын өвийг хадгалж хамгаалах, судлах, сурталчлах байгууллага юм.",
  visit: {
    time: "Даваа–Баасан: 09:00–18:00",
    ticket: "Насанд хүрэгч, оюутан, сурагчийн тасалбар",
    location: "Хэнтий аймаг, Хэрлэн сум",
  },
  halls: [
    {
      title: "Түүхийн танхим",
      desc: "Хэнтий нутгийн түүхэн дурсгал, баримт, үзмэрүүд.",
    },
    {
      title: "Археологийн танхим",
      desc: "Эртний олдвор, булш, хүрэл зэвсгийн үеийн дурсгал.",
    },
    {
      title: "Угсаатны зүйн танхим",
      desc: "Монгол ахуй, эдлэл хэрэглэл, уламжлалт соёл.",
    },
  ],
  collections: [
    {
      title: "Археологийн олдвор",
      desc: "Түүхэн үнэ цэнтэй үзмэр.",
      image: "https://ncch.gov.mn/Images/Museum/23/photo.jpg",
    },
  ],
  exhibitions: [
    {
      title: "Шинэ үзэсгэлэн",
      desc: "Хэнтий нутгийн түүхэн өвийн үзэсгэлэн.",
    },
  ],
  education: [
    {
      title: "Сурагчдын музейн хөтөлбөр",
      desc: "ЕБС-ийн сурагчдад зориулсан танин мэдэхүйн сургалт.",
    },
  ],
  news: [
    {
      title: "Музейн мэдээ",
      desc: "Музейн шинэ мэдээлэл энд байрлана.",
    },
  ],
  contact: {
    phone: "99112233",
    email: "museum@email.mn",
    address: "Хэнтий аймаг, Хэрлэн сум",
    facebook: "facebook.com",
  },
};

function mergeData(savedData) {
  return {
    ...defaultData,
    ...savedData,
    visit: { ...defaultData.visit, ...(savedData?.visit || {}) },
    contact: { ...defaultData.contact, ...(savedData?.contact || {}) },
    halls: savedData?.halls || defaultData.halls,
    collections: savedData?.collections || defaultData.collections,
    exhibitions: savedData?.exhibitions || defaultData.exhibitions,
    education: savedData?.education || defaultData.education,
    news: savedData?.news || defaultData.news,
  };
}

function App() {
  const [data, setDataState] = useState(defaultData);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (window.location.pathname === "/admin") setIsAdminPage(true);

    const dataRef = ref(db, "museumData");

    onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setDataState(mergeData(snapshot.val()));
      } else {
        set(dataRef, defaultData);
      }
    });
  }, []);

  const saveData = (newData) => {
    const fixedData = mergeData(newData);
    setDataState(fixedData);
    set(ref(db, "museumData"), fixedData);
  };

  const loginAdmin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
    } catch {
      alert("Email эсвэл нууц үг буруу байна");
    }
  };

  const logoutAdmin = async () => {
    await signOut(auth);
    setLoggedIn(false);
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();
    return result.secure_url || null;
  };

  const uploadHeroImage = async (file) => {
    const url = await uploadToCloudinary(file);

    if (url) {
      saveData({ ...data, heroImage: url });
      alert("Нүүр зураг амжилттай upload боллоо");
    } else {
      alert("Зураг upload хийхэд алдаа гарлаа");
    }
  };

  const uploadItemImage = async (file, section, index) => {
    const url = await uploadToCloudinary(file);

    if (url) {
      updateArrayItem(section, index, "image", url);
      alert("Зураг амжилттай upload боллоо");
    } else {
      alert("Зураг upload хийхэд алдаа гарлаа");
    }
  };

  const updateArrayItem = (section, index, field, value) => {
    const updated = (data[section] || []).map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    saveData({
      ...data,
      [section]: updated,
    });
  };

  const addArrayItem = (section, item) => {
    saveData({
      ...data,
      [section]: [...(data[section] || []), item],
    });
  };

  const deleteArrayItem = (section, index) => {
    saveData({
      ...data,
      [section]: (data[section] || []).filter((_, i) => i !== index),
    });
  };

  if (isAdminPage) {
    return (
      <div className="admin-page">
        {!loggedIn ? (
          <div className="login-box">
            <h1>Админ нэвтрэх</h1>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={loginAdmin}>Нэвтрэх</button>
          </div>
        ) : (
          <div className="admin-dashboard">
            <h1>Музейн админ самбар</h1>

            <h2>Ерөнхий мэдээлэл</h2>

            <input
              value={data.museumName}
              onChange={(e) =>
                saveData({ ...data, museumName: e.target.value })
              }
              placeholder="Музейн нэр"
            />

            <input
              value={data.slogan}
              onChange={(e) => saveData({ ...data, slogan: e.target.value })}
              placeholder="Уриа"
            />

            <input
              value={data.heroTitle}
              onChange={(e) => saveData({ ...data, heroTitle: e.target.value })}
              placeholder="Нүүрний гарчиг"
            />

            <textarea
              value={data.heroText}
              onChange={(e) => saveData({ ...data, heroText: e.target.value })}
              placeholder="Нүүрний тайлбар"
            />

            <input
              value={data.heroImage}
              onChange={(e) => saveData({ ...data, heroImage: e.target.value })}
              placeholder="Нүүр зургийн URL"
            />

            <label className="upload-label">
              Нүүр зураг upload:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadHeroImage(e.target.files[0])}
              />
            </label>

            <h2>Музейн тухай</h2>
            <textarea
              value={data.about}
              onChange={(e) => saveData({ ...data, about: e.target.value })}
              placeholder="Музейн тухай"
            />

            <h2>Зочлох мэдээлэл</h2>

            <input
              value={data.visit.time}
              onChange={(e) =>
                saveData({
                  ...data,
                  visit: { ...data.visit, time: e.target.value },
                })
              }
              placeholder="Ажиллах цаг"
            />

            <input
              value={data.visit.ticket}
              onChange={(e) =>
                saveData({
                  ...data,
                  visit: { ...data.visit, ticket: e.target.value },
                })
              }
              placeholder="Тасалбар"
            />

            <input
              value={data.visit.location}
              onChange={(e) =>
                saveData({
                  ...data,
                  visit: { ...data.visit, location: e.target.value },
                })
              }
              placeholder="Байршил"
            />

            <AdminList
              title="Танхимууд"
              section="halls"
              data={data}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              deleteArrayItem={deleteArrayItem}
            />

            <AdminList
              title="Цахим үзмэр"
              section="collections"
              data={data}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              deleteArrayItem={deleteArrayItem}
              uploadItemImage={uploadItemImage}
              image
            />

            <AdminList
              title="Үзэсгэлэн"
              section="exhibitions"
              data={data}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              deleteArrayItem={deleteArrayItem}
            />

            <AdminList
              title="Сургалт"
              section="education"
              data={data}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              deleteArrayItem={deleteArrayItem}
            />

            <AdminList
              title="Мэдээ"
              section="news"
              data={data}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              deleteArrayItem={deleteArrayItem}
            />

            <h2>Холбоо барих</h2>

            <input
              value={data.contact.phone}
              onChange={(e) =>
                saveData({
                  ...data,
                  contact: { ...data.contact, phone: e.target.value },
                })
              }
              placeholder="Утас"
            />

            <input
              value={data.contact.email}
              onChange={(e) =>
                saveData({
                  ...data,
                  contact: { ...data.contact, email: e.target.value },
                })
              }
              placeholder="Email"
            />

            <input
              value={data.contact.address}
              onChange={(e) =>
                saveData({
                  ...data,
                  contact: { ...data.contact, address: e.target.value },
                })
              }
              placeholder="Хаяг"
            />

            <input
              value={data.contact.facebook}
              onChange={(e) =>
                saveData({
                  ...data,
                  contact: { ...data.contact, facebook: e.target.value },
                })
              }
              placeholder="Facebook"
            />

            <div className="admin-actions">
              <button onClick={() => (window.location.href = "/")}>
                Нүүр рүү буцах
              </button>
              <button onClick={logoutAdmin}>Гарах</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>{data.museumName}</h1>
          <p>{data.slogan}</p>
        </div>

        <nav>
          <a href="#about">Музейн тухай</a>
          <a href="#visit">Зочлох</a>
          <a href="#halls">Танхимууд</a>
          <a href="#collection">Цахим сан</a>
          <a href="#exhibition">Үзэсгэлэн</a>
          <a href="#education">Сургалт</a>
          <a href="#news">Мэдээ</a>
          <a href="#contact">Холбоо</a>
        </nav>
      </header>

      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), url(${data.heroImage})`,
        }}
      >
        <div className="overlay">
          <h2>{data.heroTitle}</h2>
          <p>{data.heroText}</p>
        </div>
      </section>

      <Section id="about" title="Музейн тухай" text={data.about} />

      <section id="visit" className="section cards-section">
        <h2>Зочлох мэдээлэл</h2>
        <div className="cards">
          <Card title="Ажиллах цаг" desc={data.visit.time} />
          <Card title="Тасалбар" desc={data.visit.ticket} />
          <Card title="Байршил" desc={data.visit.location} />
        </div>
      </section>

      <CardSection id="halls" title="Танхимууд" items={data.halls} />

      <CardSection
        id="collection"
        title="Цахим үзмэр"
        items={data.collections}
        image
      />

      <CardSection id="exhibition" title="Үзэсгэлэн" items={data.exhibitions} />

      <CardSection
        id="education"
        title="Боловсролын хөтөлбөр"
        items={data.education}
      />

      <CardSection id="news" title="Мэдээ мэдээлэл" items={data.news} />

      <footer id="contact" className="footer">
        <h3>{data.museumName}</h3>
        <p>{data.contact.address}</p>
        <p>{data.contact.phone}</p>
        <p>{data.contact.email}</p>
        <p>{data.contact.facebook}</p>
      </footer>
    </div>
  );
}

function Section({ id, title, text }) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function Card({ title, desc, image }) {
  return (
    <article className="card">
      {image && <img src={image} alt={title} />}
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function CardSection({ id, title, items, image }) {
  return (
    <section id={id} className="section cards-section">
      <h2>{title}</h2>
      <div className="cards">
        {(items || []).map((item, index) => (
          <Card
            key={index}
            title={item.title}
            desc={item.desc}
            image={image ? item.image : null}
          />
        ))}
      </div>
    </section>
  );
}

function AdminList({
  title,
  section,
  data,
  updateArrayItem,
  addArrayItem,
  deleteArrayItem,
  image,
  uploadItemImage,
}) {
  return (
    <div className="admin-block">
      <h2>{title}</h2>

      <button
        onClick={() =>
          addArrayItem(
            section,
            image
              ? { title: "Шинэ үзмэр", desc: "Тайлбар", image: "" }
              : { title: "Шинэ мэдээлэл", desc: "Тайлбар" }
          )
        }
      >
        + Нэмэх
      </button>

      {(data[section] || []).map((item, index) => (
        <div className="edit-box" key={index}>
          <input
            value={item.title || ""}
            onChange={(e) =>
              updateArrayItem(section, index, "title", e.target.value)
            }
            placeholder="Гарчиг"
          />

          <textarea
            value={item.desc || ""}
            onChange={(e) =>
              updateArrayItem(section, index, "desc", e.target.value)
            }
            placeholder="Тайлбар"
          />

          {image && (
            <>
              <input
                value={item.image || ""}
                onChange={(e) =>
                  updateArrayItem(section, index, "image", e.target.value)
                }
                placeholder="Зургийн URL"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  uploadItemImage(e.target.files[0], section, index)
                }
              />
            </>
          )}

          <button onClick={() => deleteArrayItem(section, index)}>
            Устгах
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
