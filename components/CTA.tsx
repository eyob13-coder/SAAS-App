import Link from "next/link"

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start Learning your way.</div>
      <h2 className="text-3xl font-bold">
        Build A Personalize Learning Companion
      </h2>
      <p>Pick a name, Subject, Voice, & personality - and start learning through voice conversations that feel natural and fun.</p>

      <img
      src="images/cta.svg"
      alt="cta"
      width={362}
      height={232}
      loading="lazy"
      />
      <button className="btn-primary">
        <img
        src="/icons/plus.svg"
        alt="plus"
        width={12}
        height={12}
        loading="lazy"
        />

        <Link href= "/companions/new">
        <p>Build a New Companion</p>

        </Link>

      </button>
    </section>
  )
}

export default CTA