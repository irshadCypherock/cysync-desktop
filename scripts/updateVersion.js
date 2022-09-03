const axios = require("axios");

const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;

const VERSION_FILE_NAME = 'version.txt';

const getArgs = () => {
  const CMD_ERROR_MSG =
    "Invalid command. Expected command: `node <file_name>.js <PR Title>`";

  const args = process.argv.slice(2);

  if (args.length !== 1) {
    throw new Error(CMD_ERROR_MSG);
  }

  const title = args[0].trim().toLowerCase();

  let bumpType = "";

  if (title.startsWith("bump feat")) {
    bumpType = "feat";
  } else if (title.startsWith("bump bugfix")) {
    bumpType = "bugfix";
  } else if (title.startsWith("bump minor")) {
    bumpType = "minor";
  } else if (title.startsWith("bump major")) {
    bumpType = "major";
  } else {
    console.log("Ignoring PR with title: " + title);
    process.exit(0);
  }

  return {
    bumpType,
  };
};

const decodeVersion = (version) => {
  if (!version) {
    return "1.0.0.0";
  }

  const versionArray = version.split(".");
  if (versionArray.length !== 4) {
    throw new Error("Invalid version in version file: " + version);
  }

  return {
    major: parseInt(versionArray[0]),
    minor: parseInt(versionArray[1]),
    feature: parseInt(versionArray[2]),
    bugfix: parseInt(versionArray[3]),
  };
};

const encodeVersion = (version) => {
  return `${version.major}.${version.minor}.${version.feature}.${version.bugfix}`;
};

const encodeVersionForPackageJson = (version) => {
  return `${version.major}.${version.minor}.${
    version.feature * 256 + version.bugfix
  }`;
};

const getUpdatedVersion = ({ previousVersion, bumpType }) => {
  const decodedVersion = decodeVersion(previousVersion);

  switch (bumpType) {
    case "major":
      decodedVersion.major++;
      break;
    case "minor":
      decodedVersion.minor++;
      break;
    case "feature":
      decodedVersion.feature++;
      break;
    case "bugfix":
      decodedVersion.bugfix++;
      break;
  }

  return decodedVersion;
};

const updatePackageJson = async ({ githubRepo, version, bumpType }) => {
  let previousFileContent = {};
  let sha = "";

  try {
    const fileContentResp = await axios.get(
      `${GITHUB_BASE_API}/repos/${githubRepo}/contents/cysync/package.json`,
      { headers: { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } }
    );

    if (!fileContentResp?.data?.content) {
      throw new Error("Cannot find file content");
    }

    previousFileContent = JSON.parse(
      Buffer.from(fileContentResp.data.content, "base64").toString().trim()
    );
    sha = fileContentResp.data.sha;
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error;
    }
  }

  previousFileContent.version = `${encodeVersionForPackageJson(version)}`;
  let fileContent = JSON.stringify(previousFileContent);

  const postData = {
    content: Buffer.from(fileContent, "utf-8").toString("base64"),
    message: `Bumped Version: ${bumpType}`,
  };

  if (sha) {
    postData.sha = sha;
  }

  await axios.put(
    `${GITHUB_BASE_API}/repos/${githubRepo}/contents/cysync/package.json`,
    postData,
    { headers: { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } }
  );
};

const updateVersionFile = async ({ githubRepo, bumpType }) => {
  let previousFileContent = "";
  let sha = "";

  try {
    const fileContentResp = await axios.get(
      `${GITHUB_BASE_API}/repos/${githubRepo}/contents/${VERSION_FILE_NAME}`,
      { headers: { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } }
    );

    if (!fileContentResp?.data?.content) {
      throw new Error("Cannot find file content");
    }

    previousFileContent = Buffer.from(fileContentResp.data.content, "base64")
      .toString()
      .trim();
    sha = fileContentResp.data.sha;
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error;
    }
  }

  const updatedVersion = getUpdatedVersion({
    previousVersion: previousFileContent,
    bumpType,
  });

  let fileContent = `${encodeVersion(updatedVersion)}`;

  const postData = {
    content: Buffer.from(fileContent, "utf-8").toString("base64"),
    message: `Bumped Version: ${bumpType}`,
  };

  if (sha) {
    postData.sha = sha;
  }

  await axios.put(
    `${GITHUB_BASE_API}/repos/${githubRepo}/contents/${VERSION_FILE_NAME}`,
    postData,
    { headers: { Authorization: `token ${GITHUB_ACCESS_TOKEN}` } }
  );

  await updatePackageJson({ githubRepo, updatedVersion, bumpType });
};

const run = async () => {
  try {
    const { bumpType } = getArgs();
    await updateVersionFile({ bumpType, githubRepo: GITHUB_REPOSITORY });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();