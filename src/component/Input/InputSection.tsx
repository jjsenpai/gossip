/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ChangeEvent,
    ClipboardEventHandler,
    FC,
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Alert from "../Alert";
import Spin from "react-cssfx-loading/src/Spin";
import { useParams } from "react-router-dom";
import { useStore } from "../../store";
import { db, storage } from "../../firebase";
import { EMOJI_REPLACEMENT } from "../../constants";
import { formatFileName } from "../utils";

interface InputSectionProps {
    disabled: boolean;
    setInputSectionOffset?: (value: number) => void;
}

const InputSection: FC<InputSectionProps> = ({
    disabled,
    setInputSectionOffset,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [fileUploading, setFileUploading] = useState(false);
    const [previewFiles, setPreviewFiles] = useState<string[]>([]);
    const [isAlertOpened, setIsAlertOpened] = useState(false);
    const [alertText, setAlertText] = useState("");
    const { id: conversationId } = useParams();
    const currentUser = useStore((state) => state.currentUser);
    const textInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileDragging, setFileDragging] = useState(false);
    const updateTimestamp = () => {
        updateDoc(doc(db, "conversations", conversationId as string), {
            updatedAt: serverTimestamp(),
        });
    };

    useEffect(() => {
        const handler = () => {
            textInputRef.current?.focus();
        };
        window.addEventListener("focus", handler);
        return () => window.removeEventListener("focus", handler);
    }, []);

    useEffect(() => {
        textInputRef.current?.focus();
    }, [conversationId]);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (previewFiles.length > 0) {
            setPreviewFiles([]);
            for (let i = 0; i < previewFiles.length; i++) {
                const url = previewFiles[i];
                const res = await fetch(url);
                const blob = await res.blob();
                const file = new File([blob], "image.png", {
                    type: res.headers.get("content-type") as string,
                });
                await uploadFile(file);
            }
        } else {
            if (fileUploading) return;
        }

        if (!inputValue.trim()) return;

        setInputValue("");

        let replacedInputValue = ` ${inputValue} `;

        Object.entries(EMOJI_REPLACEMENT).map(([key, value]) => {
            value.forEach((item) => {
                replacedInputValue = replacedInputValue
                    .split(` ${item} `)
                    .join(` ${key} `);
            });
        });

        addDoc(
            collection(
                db,
                "conversations",
                conversationId as string,
                "messages"
            ),
            {
                sender: currentUser?.uid,
                content: replacedInputValue.trim(),
                type: "text",
                createdAt: serverTimestamp(),
            }
        );

        updateTimestamp();
    };

    const uploadFile = async (file: File) => {
        try {
            const TWENTY_MB = 1024 * 1024 * 20;

            if (file.size > TWENTY_MB) {
                setAlertText("Max file size is 20MB");
                setIsAlertOpened(true);
                return;
            }

            setFileUploading(true);

            const fileReference = ref(storage, formatFileName(file.name));

            await uploadBytes(fileReference, file);

            const downloadURL = await getDownloadURL(fileReference);

            addDoc(
                collection(
                    db,
                    "conversations",
                    conversationId as string,
                    "messages"
                ),
                {
                    sender: currentUser?.uid,
                    content: downloadURL,
                    type: file.type.startsWith("image") ? "image" : "file",
                    file: file.type.startsWith("image")
                        ? null
                        : {
                              name: file.name,
                              size: file.size,
                          },
                    createdAt: serverTimestamp(),
                }
            );

            setFileUploading(false);
            updateTimestamp();
        } catch (error) {
            console.log(error);
            setFileUploading(false);
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        uploadFile(file);
    };

    const handleReplaceEmoji = (e: any) => {
        if (e.key === " ") {
            if (e.target.selectionStart !== e.target.selectionEnd) return;

            const lastWord = inputValue
                .slice(0, e.target.selectionStart)
                .split(" ")
                .slice(-1)[0];

            if (lastWord.length === 0) return;

            Object.entries(EMOJI_REPLACEMENT).map(([key, value]) => {
                value.forEach((item) => {
                    if (item === lastWord) {
                        const splitted = inputValue.split("");
                        splitted.splice(
                            e.target.selectionStart - lastWord.length,
                            lastWord.length,
                            key
                        );
                        setInputValue(splitted.join(""));
                    }
                });
            });
        }
    };

    useEffect(() => {
        if (!setInputSectionOffset) return;
        if (previewFiles.length > 0) return setInputSectionOffset(128);

        setInputSectionOffset(0);
    }, [previewFiles.length]);

    const handlePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
        const file = e?.clipboardData?.files?.[0];
        if (!file || !file.type.startsWith("image")) return;

        const url = URL.createObjectURL(file);

        setPreviewFiles([...previewFiles, url]);
    };

    useEffect(() => {
        const dragBlurHandler = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            setFileDragging(false);
        };

        const dragFocusHandler = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            setFileDragging(true);
        };

        const dropFileHandler = async (e: any) => {
            e.preventDefault();
            e.stopPropagation();

            setFileDragging(false);

            const items = e.dataTransfer.items;
            const files = e.dataTransfer.files;

            const selectedFiles = [];

            for (let i = 0, item; (item = items[i]); ++i) {
                const entry = item.webkitGetAsEntry();
                if (entry.isFile) {
                    selectedFiles.push(files[i]);
                }
            }

            for (let i = 0; i < selectedFiles.length; i++) {
                await uploadFile(selectedFiles[i]);
            }
        };

        addEventListener("dragenter", dragFocusHandler);
        addEventListener("dragover", dragFocusHandler);
        addEventListener("dragleave", dragBlurHandler);
        addEventListener("drop", dropFileHandler);

        return () => {
            removeEventListener("dragenter", dragFocusHandler);
            removeEventListener("dragover", dragFocusHandler);
            removeEventListener("dragleave", dragBlurHandler);
            removeEventListener("drop", dropFileHandler);
        };
    }, []);

    return (
        <>
            {fileDragging && (
                <div className="pointer-events-none fixed top-0 left-0 z-20 flex h-full w-full select-none items-center justify-center backdrop-blur-sm">
                    <h1 className="text-3xl">Drop file to send</h1>
                </div>
            )}
            {previewFiles.length > 0 && (
                <div className="border-dark-lighten flex h-32 items-center gap-2 border-t px-4">
                    {previewFiles.map((preview) => (
                        <div key={preview} className="relative">
                            <img
                                className="h-28 w-28 object-cover"
                                src={preview}
                                alt=""
                            />
                            <button
                                onClick={() =>
                                    setPreviewFiles(
                                        previewFiles.filter(
                                            (item) => item !== preview
                                        )
                                    )
                                }
                                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-100"
                            >
                                <i className="bx bx-x text-dark text-lg"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div
                className={`border-dark-lighten flex h-16 items-stretch gap-1 border-t px-4 ${
                    disabled ? "pointer-events-none select-none" : ""
                }`}
            >
                <button
                    onClick={() => imageInputRef.current?.click()}
                    className="text-primary flex flex-shrink-0 items-center text-2xl"
                >
                    <i className="bx bxs-image-add"></i>
                </button>
                <input
                    ref={imageInputRef}
                    hidden
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary flex flex-shrink-0 items-center text-2xl"
                >
                    <i className="bx bx-link-alt"></i>
                </button>
                <input
                    ref={fileInputRef}
                    hidden
                    className="hidden"
                    type="file"
                    onChange={handleFileInputChange}
                />

                <form
                    onSubmit={handleFormSubmit}
                    className="flex flex-grow items-stretch gap-1"
                >
                    <div className="relative flex flex-grow items-center">
                        <input
                            maxLength={1000}
                            disabled={disabled}
                            ref={textInputRef}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                            }}
                            onKeyDown={handleReplaceEmoji}
                            onPaste={handlePaste}
                            className="bg-dark-lighten h-9 w-full rounded-full pl-3 pr-10 outline-none"
                            type="text"
                            placeholder="Message..."
                        />
                    </div>
                    {fileUploading ? (
                        <div className="ml-1 flex items-center">
                            <Spin width="24px" height="24px" color="#0D90F3" />
                        </div>
                    ) : (
                        <button className="text-primary flex flex-shrink-0 items-center text-2xl">
                            <i className="bx bxs-send"></i>
                        </button>
                    )}
                </form>
            </div>

            <Alert
                isOpened={isAlertOpened}
                setIsOpened={setIsAlertOpened}
                text={alertText}
                isError
            />
        </>
    );
};

export default InputSection;
