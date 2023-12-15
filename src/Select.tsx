import { useState, useEffect, useRef } from "react";
import styles from "./Select.module.css";

interface Props {
    loading: boolean;
    items: any[];
    current: string;
    func: (item: any) => void;
    texts: any;
    type: "lang" | "serv";
    dir: "rtl" | "ltr";
}

export function Select({ loading, items, current, func, texts, type, dir }: Props) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const firstRef = useRef(null);

    useEffect(() => {
        if (open && firstRef.current) {
            // @ts-ignore
            firstRef.current.focus();
        }
    }, [open]);

    useEffect(() => {
        const handleOutsideClick = (e: any) => {
            // @ts-ignore
            if (buttonRef.current && !buttonRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (e: any) => {
            if (open && e.key === "Escape") {
                setOpen(false);
                // @ts-ignore
                buttonRef.current.focus();
            }
        };

        document.addEventListener("click", handleOutsideClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleOutsideClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    if (!items.length) return null;

    return (
        <div
            aria-owns="listbox"
            aria-expanded={open}
            aria-controls="listbox"
            aria-haspopup="listbox"
            className={styles.select + " " + (dir === "rtl" ? styles.rtl : "")}
        >
            <button
                ref={buttonRef}
                onClick={() => {
                    if (loading) return;
                    setOpen((prev) => !prev);
                }}
            >
                {type === "lang"
                    ? texts["language_native_" + current.toLowerCase()]
                    : type === "serv"
                    ? texts[current.name] + " " + current.id
                    : texts[current]}

                {loading && "Loading..."}
            </button>

            <ul
                aria-hidden={!open}
                aria-label="Select an option"
                style={{ visibility: open ? "visible" : "hidden" }}
            >
                {items.map((item, i) => (
                    <li
                        key={i}
                        tabIndex={0}
                        role="option"
                        aria-selected={item === current}
                        ref={i === 0 ? firstRef : null}
                        onClick={() => func(item)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                func(item);
                                // @ts-ignore
                                buttonRef.current.focus();
                            }
                        }}
                    >
                        {type === "lang"
                            ? texts["language_native_" + item.toLowerCase()]
                            : type === "serv"
                            ? `${texts[item.name]} ${item.id}`
                            : texts[item]}
                    </li>
                ))}
            </ul>
        </div>
    );
}
