import { createContext, ParentProps, useContext } from "solid-js";
import { NavState } from "./createNavState";

const NavContext = createContext<NavState>();
export const useNavContext = () => {
    const ctx = useContext(NavContext);
    if (!ctx) throw new Error("Unable to access Nav Controller Context. Is this component inside the context provider?");
    return ctx;
}

export function NavProvider(props: ParentProps<{nav: NavState}>) {
    return (
        <NavContext.Provider value={props.nav}>
            {props.children}
        </NavContext.Provider>
    )
}