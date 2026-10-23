export default function IssnTags({ journal }) {
    return (
        <>
            {journal.issn && (
                <span className="card-event__tech-tag" title="International Standard Serial Number">
                    <b>ISSN</b> {journal.issn}
                </span>
            )}
            {journal.eissn && (
                <span className="card-event__tech-tag" title="Electronic ISSN">
                    <b>E-ISSN</b> {journal.eissn}
                </span>
            )}
        </>
    );
}
