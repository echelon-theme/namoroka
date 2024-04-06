export async function waitForElement(selector, root = this.document)
{
    while (root.querySelector(selector) == null)
    {
        await new Promise(r => this.requestAnimationFrame(r));
    }
    return root.querySelector(selector);
}