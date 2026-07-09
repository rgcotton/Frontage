import { pageShell, headerBar, resolveTheme } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, ctx = {}) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const t = theme.tokens || theme;
  const brokerage = esc(om.cover.brokerageName || 'the Broker of Record');
  const property = esc(om.cover.propertyName || 'the Property');

  const hdrHtml = theme.components?.headerBar
    ? theme.components.headerBar(om.cover.propertyName, 'Confidentiality & Disclaimer', t, false)
    : headerBar(om.cover.propertyName, 'Confidentiality & Disclaimer');

  const inner = `
    ${hdrHtml}
    <div class="section-title" style="margin-top:12px;">Confidentiality &amp; Disclaimer Notice</div>
    <div class="gold-rule"></div>
    <div style="margin-top:16px; font-size:10.5px; line-height:1.68; color:${t.textColor};">
      <p style="margin-bottom:11px;">
        This Offering Memorandum concerning ${property} is being furnished by <strong>${brokerage}</strong> solely
        for the recipient&rsquo;s evaluation of the acquisition opportunity described herein. It may not be reproduced,
        distributed, or used for any other purpose without the prior written consent of the Broker of Record.
      </p>
      <p style="margin-bottom:11px;">
        The information contained herein has been obtained from sources deemed reliable. However, neither ${brokerage} nor
        any of its affiliates, officers, employees, or agents makes any representation or warranty, express or implied,
        as to the accuracy, completeness, or reliability of any information or projections contained herein. No warranty
        of any kind is given with respect to the financial performance, physical condition, or legal status of the property.
      </p>
      <p style="margin-bottom:11px;">
        This Memorandum does not constitute, and shall not be construed as, an offer to sell or a solicitation of an offer
        to buy. All financial projections and analyses are provided for illustrative purposes only and shall not be relied
        upon as a guarantee or assurance of future results. Actual results may differ materially from those projected.
      </p>
      <p style="margin-bottom:11px;">
        The recipient is solely responsible for conducting its own independent investigation, due diligence, and analysis
        of all matters relating to the property, including but not limited to its legal, physical, environmental, financial,
        and title condition. The property is offered subject to prior sale, price change, or withdrawal from the market at
        any time and without notice.
      </p>
      <p>
        By accepting this Memorandum, the recipient agrees to hold its contents in strictest confidence, to use the
        information solely for evaluating a potential acquisition of ${property}, and to return or destroy all copies
        upon request. ${brokerage} expressly disclaims any liability for errors, omissions, or changes in the property
        or its condition.
      </p>
    </div>
  `;
  return [pageShell(inner)];
}
