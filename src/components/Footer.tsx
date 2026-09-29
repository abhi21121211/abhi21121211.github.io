import { footer, site } from '../data/content'

/** Apple-style fine-print footer. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-row">
          <p>
            Copyright © {new Date().getFullYear()} {site.name}. {footer.joke}
          </p>
          <p>
            <a href={site.webforge} target="_blank" rel="noopener">
              {footer.credit}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
