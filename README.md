<div align="center">
<img src="chrome-extension/public/icon-128.jpg" alt="logo"/>
<h1> PREVIEW Chrome Extension<br/>React + Vite + TypeScript</h1>

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)

> Used boilerplate From 
> [Jonghakseo](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)

</div>

> [!NOTE]
> 이 프로젝트는 N사 가격비교 서비스에서 제품 설명과 함께 그에 맞는 리뷰를 제공합니다

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features ](#features-)
- [Install ](#install-)
- [Procedures: ](#procedures-)
- [And next, depending on the needs:](#and-next-depending-on-the-needs)
  - [For Chrome: ](#for-chrome-)
- [Structure ](#structure-)
  - [ChromeExtension ](#chromeextension-)
  - [Pages ](#pages-)
- [Reference ](#reference-)
- [Contributors ](#contributors-)
- [Privacy Policies ](#privacy-policies-)
  - [Introduction](#introduction)
  - [Information We Collect](#information-we-collect)
    - [Personal Information](#personal-information)
    - [Usage Data](#usage-data)
  - [How We Use Your Information](#how-we-use-your-information)
  - [Data Storage and Security](#data-storage-and-security)
  - [Third-Party Services](#third-party-services)
    - [Google OAuth2](#google-oauth2)
  - [Your Rights](#your-rights)
  - [Changes to This Policy](#changes-to-this-policy)
  - [Data Retention](#data-retention)
  - [Children's Privacy](#childrens-privacy)
  - [Contact Us](#contact-us)

## Features <a name="features"></a>

- [React18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwindcss](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Turborepo](https://turbo.build/repo)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Chrome Extension Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Install <a name="install"></a>

## Procedures: <a name="procedures"></a>

1. Clone this repository.
2. Change `extensionDescription` and `extensionName` in `messages.json` file.
3. Install pnpm globally: `npm install -g pnpm` (check your node version >= 18.12.0)
4. Run `pnpm install`

## And next, depending on the needs:

### For Chrome: <a name="chrome"></a>

1. Run:
    - Dev: `pnpm dev` (it's run parallel with `pnpm dev-server` automatically)
        - When you run with Windows, you should run as
          administrator. [(Issue#456)](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/456)
    - Prod: `pnpm build`
2. Open in browser - `chrome://extensions`
3. Check - `Developer mode`
4. Find and Click - `Load unpacked extension`
5. Select - `dist` folder at root

## Structure <a name="structure"></a>

### ChromeExtension <a name="chrome-extension"></a>

Main app with background script, manifest

- `manifest.js` - manifest for chrome extension
- `lib/background` - [background script](https://developer.chrome.com/docs/extensions/mv3/background_pages/) for chrome
  extension (`background.service_worker` in
  manifest.json)
- `public/content.css` - content css for user's page injection

### Pages <a name="pages"></a>

- `content-ui` - [content script](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) for render UI in
  user's page (`content_scripts` in manifest.json)

## Reference <a name="reference"></a>

- [Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)
- [ChromeExtension](https://developer.chrome.com/docs/extensions/mv3/)


## Contributors <a name="contributors"></a>
- [9unu](https://github.com/9unu)
- [DongyubKwak](https://github.com/DongyubKwak)
- [KHUjsLee](https://github.com/KHUjsLee)

---
Made by [EunTaeKim](https://ket0825.tistory.com/)

## Privacy Policies <a name="privacy-policies"></a>
- Last Updated: November 3, 2024

### Introduction

This Privacy Policy describes how our Chrome Extension ("we," "our," or "us") collects, uses, and shares your personal information when you use our extension.

### Information We Collect

#### Personal Information
- Email address (obtained through Google OAuth2)
- Unique user identifier derived from your Google account

#### Usage Data
- Product viewing history
- Interaction with product pages
- Service usage patterns and preferences

### How We Use Your Information

We use the collected information for:
- User authentication and account management
- Tracking product viewing history
- Service improvement and feature development
- Expanding our product coverage
- Analytics and usage patterns analysis
- Personalizing your experience

### Data Storage and Security

We implement appropriate security measures to protect your personal information. Your data is stored securely and accessed only by authorized personnel.

### Third-Party Services

#### Google OAuth2
We use Google OAuth2 for user authentication. When you log in, we access:
- Your Google email address
- Basic profile information

Please review Google's Privacy Policy to understand how they handle your data.

### Your Rights

You have the right to:
- Access your personal data
- Request correction of your data
- Request deletion of your data
- Opt-out of certain data collection
- Export your data

### Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

### Data Retention

We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy.

### Children's Privacy

Our service is not intended for users under the age of 13. We do not knowingly collect information from children under 13.

### Contact Us

If you have any questions about this Privacy Policy, please contact us at ket0825@gmail.com.
