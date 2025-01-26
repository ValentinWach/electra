import React from 'react';

export default function BadgeC(props: { text: string, color: string }) {
    const [displayText, setDisplayText] = React.useState(props.text);
    const spanRef = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        const span = spanRef.current;
        if (!span) return;
        const isOverflowing = span.scrollHeight > span.clientHeight || span.scrollWidth > span.clientWidth;
        if (isOverflowing) {
        console.log("recalculating");

            let text = props.text;
            while (span.scrollHeight > span.clientHeight && text.length > 0 || span.scrollWidth > span.clientWidth && text.length > 0) {
                text = text.slice(0, -1);
                span.textContent = text + '...';
            }
            setDisplayText(text + '...');
        } else {
            setDisplayText(props.text);
        }
    }, [props.text]);

    return (
        <span 
            ref={spanRef}
            className="min-w-20 inline-flex max-w-full justify-center items-start rounded-xl px-2 py-0.5 max-h-[1.5rem] text-sm font-medium overflow-hidden" 
            style={{
                color: props.color,
                backgroundColor: `${props.color}30`
            }}
            title={props.text}
        >
            {displayText}
        </span>
    )
}