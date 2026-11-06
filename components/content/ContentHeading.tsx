import { Fragment } from 'react';
export function ContentLines({ text }: { text: string }) { return <>{text.split('\n').map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</>; }
export function ContentHeading({ title, accent, prefix }: { title: string; accent: string; prefix?: string }) { return <h2><ContentLines text={title} /><br />{prefix ? `${prefix} ` : null}<em><ContentLines text={accent} /></em></h2>; }
