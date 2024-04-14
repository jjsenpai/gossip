import { FC, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useCollectionQuery } from "../hooks/allHooks";
import { useParams } from "react-router-dom";
import Spin from "react-cssfx-loading/src/Spin";
import { formatFileSize } from "../utils";
import FileIcon from "../FileIcon";
import ImageView from "../ImageView";

export const Files: FC = () => {
    const { id: conversationId } = useParams();

    const { data, loading, error } = useCollectionQuery(
        `files-${conversationId}`,
        query(
            collection(
                db,
                "conversations",
                conversationId as string,
                "messages"
            ),
            where("type", "==", "file"),
            orderBy("createdAt", "desc")
        )
    );

    if (loading || error)
        return (
            <div className="flex h-80 items-center justify-center">
                <Spin />
            </div>
        );

    if (data?.empty)
        return (
            <div className="h-80 py-3">
                <p className="text-center">No file found</p>
            </div>
        );

    return (
        <div className="flex h-80 flex-col items-stretch gap-3 overflow-y-auto p-4">
            {data?.docs.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-2">
                    <FileIcon
                        className="h-6 w-6 object-cover"
                        extension={
                            file.data().file.name.split(".").slice(-1)[0]
                        }
                    />
                    <div className="flex-grow">
                        <h1>{file.data()?.file?.name}</h1>
                        <p>{formatFileSize(file.data()?.file?.size)}</p>
                    </div>
                    <a
                        href={file.data().content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                    >
                        <i className="bx bxs-download text-2xl"></i>
                    </a>
                </div>
            ))}
        </div>
    );
};

export const ImageItem: FC<{ src: string }> = ({ src }) => {
    const [isImageViewOpened, setIsImageViewOpened] = useState(false);

    return (
        <>
            <img
                onClick={() => setIsImageViewOpened(true)}
                className="h-[100px] w-[100px] cursor-pointer object-cover transition duration-300 hover:brightness-75"
                src={src}
                alt=""
            />
            <ImageView
                src={src}
                isOpened={isImageViewOpened}
                setIsOpened={setIsImageViewOpened}
            />
        </>
    );
};

export const Image: FC = () => {
    const { id: conversationId } = useParams();

    const { data, loading, error } = useCollectionQuery(
        `images-${conversationId}`,
        query(
            collection(
                db,
                "conversations",
                conversationId as string,
                "messages"
            ),
            where("type", "==", "image"),
            orderBy("createdAt", "desc")
        )
    );

    if (loading || error)
        return (
            <div className="flex h-80 items-center justify-center">
                <Spin />
            </div>
        );

    if (data?.empty)
        return (
            <div className="h-80 py-3">
                <p className="text-center">No image found</p>
            </div>
        );

    return (
        <div className="flex h-80 flex-wrap content-start gap-4 overflow-y-auto overflow-x-hidden p-4">
            {data?.docs.map((image) => (
                <ImageItem key={image.id} src={image.data().content} />
            ))}
        </div>
    );
};
