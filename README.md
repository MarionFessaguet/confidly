# Confidly

![Screenshot from 2025-06-27 12-43-41](https://github.com/user-attachments/assets/69a6b24d-9b3b-4592-a9cf-7615a4446461)


Welcome to Confidly — your privacy-first solution for sharing moments and memories with the people you trust.

> **Whether within a family or an organization, the same need arises:**  
> **A trusted space to share content with those who matter most.**

You can see our product demo here: https://youtu.be/NPaCW-_rCcI and our product brief here: https://www.canva.com/design/DAGrdWYHnAs/Cy5l8JxR0zJMnQwhQ-dZpA/edit

## How It Works

Confidly is fully verifiable and powered by iExec’s technology stack. iExec is The Trust Layer for DePIN & AI, providing the essential infrastructure for Ownership, Privacy, and Monetization.

Anyone can create and share memories with trusted editors.

Editors can then compile these shared memories into beautifully designed magazines, with the help of AI.

Our AI solution allows editors to effortlessly customize layout, tone, language, and more — the possibilities are endless, and above all, completely hassle-free.



## Current status

MVP is working both for UI and dAPP level. Some minor glitches remains to link it all, but we're kinda there.

Proof of execution: https://explorer.iex.ec/bellecour/task/0x54a6f8cf6ccf36d4b21a1438edb5162976f1cfe53b28d72741824f46ebdf9f08 

Our current dataset: https://explorer.iex.ec/bellecour/dataset/0xa28fad3875e3a5aacd56a5d72b68cdd9e2c9a47f

Dataset type sample:
```
{
    "v": "1",
    "datetime": "2025-06-26",
    "location": "Lyon, France",
    "images": {
      "0": "<inline content using data URI scheme>", 
      "1": "<inline content using data URI scheme>"
    }
    "title": "Hackathon",
    "description": "1ère journée au hackathon, ca démarre fort!",
    "locale": "fr",
    "emotion": "fun"
}
```

## Technical Deep Dive

Built on iExec's proven tools, memories are stored as protectedData using DataProtector.

Our dApp for magazine generation is rigorously tested and deployed with iExec's iAppGenerator and relies on Web3Mail.

![confidly-global-flow drawio (1)](https://github.com/user-attachments/assets/71cb45bd-f907-4d6e-9c5f-4ae051bf522c)

## Key Features

### 🔒 Data Protection

- Client-side encryption with iExec DataProtector  
- Decentralized, secure storage  
- Full control over your personal data  

### 🤝 Selective Sharing

- Granular, user-specific access control  
- Revoke access at any time  
- Real-time sharing notifications  

### 📖 Magazine Generation

- Automatic compilation of shared memories  
- Confidential processing using iExec computing  
- Export available in multiple formats  

### 🖼️ Multimedia Management

- Supports images and photos  
- Automatic compression and optimization  
- Metadata fully preserved  

## Getting Started

### 1. Connect Your Wallet

- Connect your Web3 wallet (MetaMask, WalletConnect)  
- Make sure you're connected to the Bellecour network (iExec Sidechain)  

### 2. Create a Memory

- Click on "Create"  
- Select the type of memory (Birthday, Trip, Birth, Event)  
- Add a title and description  
- Optionally, attach a photo  
- Click "Save" to protect your memory  

### 3. Share a Memory

- Go to the "Share" tab  
- Select the memory you want to share  
- Enter the recipient's wallet address  
- Confirm the sharing  

### 4. Create a Magazine

- View the memories shared with you  
- Select the ones you want to include  
- Click "Create Magazine"  
- Download your magazine once it's generated  

## iExec Integration

This application leverages multiple iExec technologies:

- **DataProtector**: Encryption and protection of sensitive data  
- **Confidential Computing**: Secure processing for magazine generation  
- **Access Control**: Fine-grained permission management  
- **Web3 Infrastructure**: Decentralized storage and authentication  

## Upcoming Features

While our vision is clear, we're still at the beginning of our journey.

The following features are in progress to fully realize our vision:

- UI-based prompt customization — tone and output language selection is ready under the hood (check out the code 😉)  
- Full integration with Web3Mail — temporary workarounds are in place for now  
- Allowing editors to select multiple memories simultaneously — we're ready on our side and just awaiting the official release of iExec’s multi-dataset and datapool features
- Allow users to share their memory not only with a specific dApp of a publisher, but a more advanced whitelisting management

## License

MIT License

## Support

- 📧 **Email**: support@confidly.com  
- 💬 **Discord**: Coming soon

## Useful Links

- [iExec Documentation](https://docs.iex.ec/)  
- [DataProtector SDK](https://tools.docs.iex.ec/tools/dataProtector/getting-started)  

---

**Built with ❤️ and iExec technology for a more private and secure web.**
