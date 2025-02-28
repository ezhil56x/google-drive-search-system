const { google } = require("googleapis");

async function getDriveFiles(accessToken) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: "mimeType='text/plain' or mimeType='text/markdown'",
      fields: "files(id, name, mimeType, modifiedTime, owners)",
    });

    return res.data.files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      owners: file.owners,
    }));
  } catch (err) {
    console.error("Error loading client secret file:", err);
    return [];
  }
}

async function getFileContent(accessToken, fileId) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "text" }
    );

    return res.data;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

module.exports = { getDriveFiles, getFileContent };