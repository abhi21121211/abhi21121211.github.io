import { footer, site } from '../data/content'

/** Apple-style fine-print footer. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <p className="footer-note">
          Figures on this page are taken from Abhishek’s résumé. Some client and product names are withheld.
        </p>
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
