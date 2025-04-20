export default function Buttons({children, textOnly,styles, ...prop}){
    const cssClasses= textOnly ? `text-button ${styles}`: `button ${styles}`;
    return (
        <button className={cssClasses} {...prop}>{children} </button>
    )
}