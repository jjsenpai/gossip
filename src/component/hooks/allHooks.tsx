import {
    CollectionReference,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    Query,
    QuerySnapshot,
    collection,
    doc,
    getDoc,
    limitToLast,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: { [key: string]: any } = {};

export const useCollectionQuery: (
    key: string,
    collection: CollectionReference | Query<DocumentData>
) => { loading: boolean; error: boolean; data: QuerySnapshot | null } = (
    key,
    collection
) => {
        const [data, setData] = useState<QuerySnapshot<DocumentData> | null>(
            cache[key] || null
        );

        const [loading, setLoading] = useState(!data);
        const [error, setError] = useState(false);

        useEffect(() => {
            const unsubscribe = onSnapshot(
                collection,
                (snapshot) => {
                    setData(snapshot);
                    setLoading(false);
                    setError(false);
                    cache[key] = snapshot;
                },
                (err) => {
                    console.log(err);
                    setData(null);
                    setLoading(false);
                    setError(true);
                }
            );

            return () => {
                unsubscribe();
            };

            // eslint-disable-next-line
        }, [key]);

        return { loading, error, data };
    };

export const useDocumentQuery = (
    key: string,
    document: DocumentReference<DocumentData>
) => {
    const [data, setData] = useState<DocumentSnapshot<DocumentData> | null>(
        cache[key] || null
    );
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            document,
            (snapshot) => {
                setData(snapshot);
                setLoading(false);
            },
            (err) => {
                console.log(err);
                setData(null);
                setLoading(false);
                setError(true);
            }
        );

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line
    }, [key]);

    return { loading, error, data };
};

export const useLastMessage = (conversationId: string) => {
    const [data, setData] = useState<{
        lastMessageId: string | null;
        message: string;
    } | null>(cache[conversationId] || null);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(
                collection(db, "conversations", conversationId, "messages"),
                orderBy("createdAt"),
                limitToLast(1)
            ),
            (snapshot) => {
                if (snapshot.empty) {
                    setData({
                        lastMessageId: null,
                        message: "No message recently",
                    });
                    setLoading(false);
                    setError(false);
                    return;
                }
                const type = snapshot.docs?.[0]?.data()?.type;
                let response =
                    type === "image"
                        ? "An image"
                        : type === "file"
                            ? `File: ${snapshot.docs[0]
                                ?.data()
                                ?.file?.name.split(".")
                                .slice(-1)[0]
                            }`
                            : type === "sticker"
                                ? "A sticker"
                                : type === "removed"
                                    ? "Message removed"
                                    : (snapshot.docs[0].data().content as string);

                const seconds = snapshot.docs[0]?.data()?.createdAt?.seconds;
                const formattedDate = formatDate(
                    seconds ? seconds * 1000 : Date.now()
                );

                response =
                    response.length > 30 - formattedDate.length
                        ? `${response.slice(0, 30 - formattedDate.length)}...`
                        : response;

                const result = `${response} • ${formattedDate}`;
                setData({
                    lastMessageId: snapshot.docs?.[0]?.id,
                    message: result,
                });
                cache[conversationId] = {
                    lastMessageId: snapshot.docs?.[0]?.id,
                    message: result,
                };
                setLoading(false);
                setError(false);
            },
            (err) => {
                console.log(err);
                setData(null);
                setLoading(false);
                setError(true);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [conversationId]);

    return { data, loading, error };
};

import { useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { formatDate } from "../utils";

export const useQueryParams = () => {
    const location = useLocation();
    const searchParams = Object.fromEntries(
        new URLSearchParams(location.search).entries()
    );
    return searchParams;
};

export const useUsersInfo = (userIds: string[]) => {
    const [data, setData] = useState<DocumentSnapshot<DocumentData>[] | null>(
        userIds.every((id) => cache[id]) ? userIds.map((id) => cache[id]) : null
    );
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        try {
            (async () => {
                const response = await Promise.all(
                    userIds.map(async (id) => {
                        if (cache[id]) return cache[id];
                        const res = await getDoc(doc(db, "users", id));
                        cache[id] = res;
                        return res;
                    })
                );

                setData(response);
                setLoading(false);
                setError(false);
            })();
        } catch (error) {
            console.log(error);
            setLoading(false);
            setError(true);
        }
    }, [JSON.stringify(userIds)]);

    return { data, loading, error };
};

export function useFetch<T>(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: (...arg: any) => Promise<any>
): { data: T | null; loading: boolean; error: boolean } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(cache[key] || null);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        query()
            .then((res) => {
                cache[key] = res;
                setData(res);
                setLoading(false);
                setError(false);
            })
            .catch((err) => {
                console.log(err);
                setData(null);
                setLoading(false);
                setError(true);
            });
    }, [key]);

    return { data, loading, error };
}
