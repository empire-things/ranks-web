import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Home.module.css";
import eventsJson from "./events.json";
import { Select } from "./Select";

export function Home() {
    const [theme, setTheme] = useState(0);

    const [languages, setLanguages] = useState<any>([]);
    const [servers, setServers] = useState<any>([]);
    const [texts, setTexts] = useState<any>({});

    const [lang, setLang] = useState("fr");
    const [eventName, setEventName] = useState(Object.keys(eventsJson.player)[0]);

    const [server, setServer] = useState({
        id: 3,
        name: "generic_country_FR",
        key: "EmpireEx_3",
    });

    const [categoryId, setCategoryId] = useState(0);
    const [type, setType] = useState<0 | 1>(1);
    const [event, setEvent] = useState(6);

    const [rank, setRank] = useState(1);
    const [lastRank, setLastRank] = useState(1);
    const [search, setSearch] = useState("");

    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    const events = eventsJson;
    const proxy = "https://sheltered-everglades-24913.fly.dev/";
    const gameUrl = "https://empire-html5.goodgamestudios.com/";
    const langUrl = "https://langserv.public.ggs-ep.com/";
    const baseUrl = "http://localhost:8080/";

    const hasRun = useRef(false);

    useEffect(() => {
        console.log("events", events);
    }, [events]);

    function eventsList() {
        return events[type ? "player" : "alliance"] || [];
    }

    function currentEvent() {
        return eventsList()[eventName] ?? {};
    }

    function eventId() {
        return category().eventid ?? currentEvent().id;
    }

    function category() {
        return currentEvent().categories?.[categoryId] ?? currentEvent().categories?.[0] ?? {};
    }

    function nbCateg() {
        return currentEvent().categories?.length ?? 0;
    }

    function hasPoints() {
        return !currentEvent().nopoints && !currentEvent().isLeague;
    }

    function hasMedals() {
        return !!currentEvent().isLeague;
    }

    const getLanguages = async () => {
        const response = await fetch(`${proxy}${gameUrl}config/languages/version.json`)
            .then((res) => res.json())
            .catch((err) => setError(err));

        const arr: string[] = [];

        for (const lang in response.languages) {
            if (lang.length && !lang.includes("_")) {
                await fetch(`${langUrl}em@${response.languages[lang]}/${lang}/@metadata`).then(
                    (res) => res.ok && arr.push(lang)
                );
            }
        }

        setLanguages(arr);
    };

    const setLanguage = async () => {
        const response = await fetch(`${langUrl}em/${lang}`).then((res) => res.json());
        setTexts((prev) => Object.assign(prev, response));
    };

    const getRankings = useCallback(async () => {
        const eventId = category().eventid ?? currentEvent().id;
        const catId = category().id;

        const data = await fetch(
            `${baseUrl}${
                server.key
            }/hgh/%22LT%22:${eventId},%22LID%22:${catId},%22SV%22:%22${encodeURIComponent(
                `${rank}`
            )}%22`
        )
            .then((res) => res.json())
            .catch((err) => setError(err));

        setData(data.content.L || []);
        setLastRank(data.content.LR || 1);

        if (data.content.LR < rank) setRank(data.content.LR);

        console.log("[GET] Fetch rankings: ", data);
    }, [server, rank, eventName, categoryId]);

    const getServers = async () => {
        const file = await fetch(`${proxy}${gameUrl}config/network/1.xml`)
            .then((res) => res.text())
            .then((res) => new DOMParser().parseFromString(res, "text/xml"));

        // @ts-expect-error
        if (file?.firstChild?.firstChild?.children) {
            // @ts-expect-error
            for (const instance of file.firstChild.firstChild.children) {
                if (instance.children[2].textContent !== "EmpireEx_23") {
                    setServers((prev) => [
                        ...prev,
                        {
                            key: instance.children[2].textContent,
                            id: instance.children[4].textContent,
                            name: instance.children[6].textContent,
                        },
                    ]);
                }
            }
        }
    };

    useEffect(() => {
        const run = () => {
            getLanguages();
            setLanguage();
            getServers();
            getRankings();
        };

        if (import.meta.env.PROD) {
            run();
        } else {
            if (!hasRun.current) {
                hasRun.current = true;
                run();
            }
        }
    }, []);

    function withSpaces(x: number) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    useEffect(() => {
        console.log("server", server);
        console.log("rank", rank);
        getRankings();
    }, [server, rank, categoryId, eventName]);

    return (
        <main className={styles.container}>
            <header>
                <div>
                    <Select
                        loading={!servers.length}
                        items={servers}
                        current={server}
                        func={setServer}
                        texts={texts}
                        type={"serv"}
                        dir={"ltr"}
                    />
                </div>

                <div>
                    <Select
                        loading={!languages.length}
                        items={languages}
                        current={lang}
                        func={(val) => {
                            setLang(val);
                            setLanguage();
                        }}
                        texts={texts}
                        type={"lang"}
                        dir={"rtl"}
                    />

                    <button className={styles.theme}>
                        {theme === 0 ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z" />
                                <path d="M7 20h10" />
                                <path d="M9 16v4" />
                                <path d="M15 16v4" />
                            </svg>
                        ) : theme === 1 ? (
                            <svg
                                fill="none"
                                width="16"
                                height="16"
                                shapeRendering="geometricPrecision"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="5"
                                />
                                <path d="M12 1v2" />
                                <path d="M12 21v2" />
                                <path d="M4.22 4.22l1.42 1.42" />
                                <path d="M18.36 18.36l1.42 1.42" />
                                <path d="M1 12h2" />
                                <path d="M21 12h2" />
                                <path d="M4.22 19.78l1.42-1.42" />
                                <path d="M18.36 5.64l1.42-1.42" />
                            </svg>
                        ) : (
                            <svg
                                fill="none"
                                width="16"
                                height="16"
                                shapeRendering="geometricPrecision"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <div className={styles.subHeader}>
                <Select
                    loading={
                        !Object.keys(events.alliance).length || !Object.keys(events.player).length
                    }
                    items={Object.keys(events[type ? "player" : "alliance"])}
                    current={eventName}
                    func={(val) => {
                        setEventName(val);
                        setCategoryId(0);
                    }}
                    texts={texts}
                    dir={"ltr"}
                />
            </div>

            <section>
                <div className={styles.levels}>
                    <button
                        disabled={categoryId === 0}
                        onClick={() => {
                            if (categoryId === 0) setCategoryId(nbCateg() - 1);
                            else setCategoryId((prev) => prev - 1);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12l14 0" />
                            <path d="M5 12l4 4" />
                            <path d="M5 12l4 -4" />
                        </svg>
                    </button>

                    <p>
                        {texts[category().name]
                            ?.replace(category().placeholder ?? "{0}", category().value)
                            .trim()
                            .replace(/ +/g, " ")}
                    </p>

                    <button
                        disabled={categoryId === nbCateg() - 1}
                        onClick={() => {
                            if (categoryId === nbCateg() - 1) setCategoryId(0);
                            else setCategoryId((prev) => prev + 1);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12l14 0" />
                            <path d="M15 16l4 -4" />
                            <path d="M15 8l4 4" />
                        </svg>
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.levels + " " + styles.ranks}>
                        <div>
                            <button
                                disabled={rank === 1}
                                onClick={() => {
                                    if (rank === 1) return;
                                    setRank(1);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 10l0 10" />
                                    <path d="M12 10l4 4" />
                                    <path d="M12 10l-4 4" />
                                    <path d="M4 4l16 0" />
                                </svg>
                            </button>

                            <button
                                disabled={rank <= 5}
                                onClick={() => {
                                    if (rank <= 5) return;
                                    setRank((prev) => (prev < 15 ? 1 : prev - 10));
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 5l0 14" />
                                    <path d="M16 9l-4 -4" />
                                    <path d="M8 9l4 -4" />
                                </svg>
                            </button>
                        </div>

                        <div>
                            <button
                                disabled={rank === lastRank}
                                onClick={() => {
                                    if (rank === lastRank) return;
                                    setRank((prev) => (prev === 1 ? 15 : prev + 10));
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 5l0 14" />
                                    <path d="M16 15l-4 4" />
                                    <path d="M8 15l4 4" />
                                </svg>
                            </button>

                            <button
                                disabled={rank === lastRank}
                                onClick={() => {
                                    if (rank === lastRank) return;
                                    setRank(lastRank);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 20l16 0" />
                                    <path d="M12 14l0 -10" />
                                    <path d="M12 14l4 -4" />
                                    <path d="M12 14l-4 -4" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <table className={styles.table}>
                        {data.map((obj, index) => (
                            <tr key={index}>
                                <td>{obj["0"]}</td>
                                <td>{obj["2"]["N"]}</td>

                                {/* {type === 0 && <td>{obj["2"]["AN"]}</td>} */}
                                <td>{obj["2"]["AN"]}</td>

                                <td>{withSpaces(obj["1"])}</td>
                            </tr>
                        ))}

                        {data.length === 0 && (
                            <div className={styles.loading}>
                                <div />
                                <p>Fetching data...</p>
                            </div>
                        )}
                    </table>
                </div>

                <div className={styles.search}>
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    // const isNumber = !isNaN(parseFloat(search));

                                    // if (isNumber) {
                                    //     setRank(parseInt(search));
                                    //     setSearch("");
                                    // }

                                    setRank(search);
                                    setSearch("");
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const isNumber = !isNaN(parseFloat(search));

                                if (isNumber) {
                                    setRank(parseInt(search));
                                    setSearch("");
                                }
                            }}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
