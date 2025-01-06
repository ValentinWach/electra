export default function BadgeC(props: {text: string, color: string}) {
    return (
        <span className="min-w-20 inline-flex justify-center items-center rounded-xl px-2 py-0.5 text-sm font-medium" style={{
            color: props.color,
            backgroundColor: `${props.color}30`
        }}>
            {props.text}
        </span>
    )
}