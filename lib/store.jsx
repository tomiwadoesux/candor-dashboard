"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  TALENT_WITH_AGENTS,
  TEAM,
  SEED_THREADS,
  SEED_COMMUNITY,
  SEED_NOTIFS,
  ME_ID,
  ADMIN_ME_ID,
} from "@/lib/seed";

const STORAGE_KEY = "candor-store-v1";

const initialState = {
  talent: TALENT_WITH_AGENTS,
  team: TEAM,
  threads: SEED_THREADS,
  community: SEED_COMMUNITY,
  notifications: SEED_NOTIFS,
};

function reducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload };

    case "talent.update": {
      const { id, patch } = action;
      return {
        ...state,
        talent: state.talent.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        ),
      };
    }

    case "thread.create": {
      return { ...state, threads: [action.thread, ...state.threads] };
    }

    case "thread.reply": {
      const { threadId, message } = action;
      return {
        ...state,
        threads: state.threads.map((th) =>
          th.id === threadId
            ? {
                ...th,
                messages: [...th.messages, message],
                lastAt: message.at,
              }
            : th
        ),
      };
    }

    case "thread.react": {
      const { threadId, messageId, reaction, actorId } = action;
      return {
        ...state,
        threads: state.threads.map((th) => {
          if (th.id !== threadId) return th;
          return {
            ...th,
            messages: th.messages.map((m) => {
              if (m.id !== messageId) return m;
              const current = m.reactions?.[reaction] || [];
              const next = current.includes(actorId)
                ? current.filter((x) => x !== actorId)
                : [...current, actorId];
              const reactions = { ...(m.reactions || {}), [reaction]: next };
              if (reactions[reaction].length === 0) delete reactions[reaction];
              return { ...m, reactions };
            }),
          };
        }),
      };
    }

    case "community.add":
      return { ...state, community: [action.post, ...state.community] };

    case "community.update":
      return {
        ...state,
        community: state.community.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        ),
      };

    case "community.delete":
      return {
        ...state,
        community: state.community.filter((p) => p.id !== action.id),
      };

    case "notif.markAllRead":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "notif.add":
      return {
        ...state,
        notifications: [action.notif, ...state.notifications],
      };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "hydrate", payload: parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist to localStorage on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

// Selector helpers
export function useTalent() {
  const { state } = useStore();
  return state.talent;
}
export function useTeam() {
  const { state } = useStore();
  return state.team;
}
export function useThreads() {
  const { state } = useStore();
  return state.threads;
}
export function useCommunity() {
  const { state } = useStore();
  return state.community;
}
export function useNotifications() {
  const { state } = useStore();
  return state.notifications;
}

export function useMe() {
  const talent = useTalent();
  return talent.find((t) => t.id === ME_ID);
}

export function useAgent(talent) {
  const team = useTeam();
  if (!talent) return null;
  return team.find((m) => m.id === talent.agentId) || team[0];
}

// Actions
export function useActions() {
  const { dispatch } = useStore();

  return useMemo(
    () => ({
      updateTalent: (id, patch) =>
        dispatch({ type: "talent.update", id, patch }),
      createThread: (thread) => dispatch({ type: "thread.create", thread }),
      replyToThread: (threadId, message) =>
        dispatch({ type: "thread.reply", threadId, message }),
      react: (threadId, messageId, reaction, actorId) =>
        dispatch({
          type: "thread.react",
          threadId,
          messageId,
          reaction,
          actorId,
        }),
      addCommunityPost: (post) =>
        dispatch({ type: "community.add", post }),
      updateCommunityPost: (id, patch) =>
        dispatch({ type: "community.update", id, patch }),
      deleteCommunityPost: (id) =>
        dispatch({ type: "community.delete", id }),
      markAllNotifsRead: () => dispatch({ type: "notif.markAllRead" }),
      addNotification: (notif) => dispatch({ type: "notif.add", notif }),
    }),
    [dispatch]
  );
}

export { ME_ID, ADMIN_ME_ID };
