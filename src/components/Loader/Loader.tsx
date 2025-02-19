import { ImSpinner2 } from "react-icons/im";

interface Props {
  isLoading: boolean;
}

/**
 * A spinner component that displays a loading indicator.
 * The spinner becomes visible when loading is in progress and fades out when loading is complete.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Controls the visibility of the spinner
 *
 * @example
 * <Loader isLoading={true} />
 */
function Loader({ isLoading }: Props) {
  return (
    <ImSpinner2
      className="rotate"
      style={{
        opacity: isLoading ? 1 : 0,
        position: "fixed",
        fontSize: "2rem",
        top: "20px",
        right: "calc(50% - 1rem)",
        transition: "0.3s ease",
        pointerEvents: "none",
        verticalAlign: "middle",
        animation: "rotate 1s linear infinite",
      }}
    />
  );
}

export default Loader;
