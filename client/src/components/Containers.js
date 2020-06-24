import styled from "styled-components"

//type: "multiple" | "single" | "action"

// export const Row = ({ children, ...props }) => {
//     const type = props.type
//     const [buttons, setButtons] = useState(children)
//     return (
//         <StyledRow
//             onClick={(e) => {
//                 console.log(e.target)
//                 for (const button of children) {
//                     console.log(child)
//                 }
//             }}
//             {...props}
//         >
//             {children}
//         </StyledRow>
//     )
// }

export const Row = styled.div`
    display: grid;
    grid-template-rows: 1fr;
    gap: ${props => props.gap ?? "1rem"};
    width: ${props => props.width ?? "100%"};
    height: ${props => props.height ?? "unset"};
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
`

export const Column = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${props => props.gap ?? "1rem"};
    width: ${props => props.width ?? "10rem"};
    height: ${props => props.height ?? "unset"};
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
`