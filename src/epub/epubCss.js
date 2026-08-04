export const epubCss = `
body {
    margin: 0;
    padding: 0 8%;
    font-family: serif;
    line-height: 1.55;
    font-size: 1em;
}
h1, h2, h3 {
    font-weight: 700;
    margin: 1.2em 0 0.6em; 
    }
h1 {
    font-size: 1.55em;
    text-align: center;
    }
p {
    margin: 0.6em 0;
    }
.title-page {
    text-align: center; 
    }
.title-page .cover {
    display: block; max-width: 90%;
    max-height: 80vh;
    margin: 0 auto 1.5em;
    }
.title-page h1 {
    font-size: 1.8em;
    margin-bottom: 0.4em;
    }
.title-page h2 {
    font-size: 1.2em; margin-top: 0;
    }
.meta-block {
    margin-top: 2em;
    font-size: 0.9em;
    text-align: left;
    }
.meta-block p {
    margin: 0.2em 0;
    }
.footnotes {
    margin-top: 2em;
    border-top: 1px solid #999;
    font-size: 0.9em;
    }
.footnote-ref {
    text-decoration: none;
    vertical-align: super;
    font-size: 0.8em;
    }
`;
