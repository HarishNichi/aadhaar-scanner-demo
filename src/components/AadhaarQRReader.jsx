/* eslint-disable no-undef */
'use client';

import React, { useState } from "react";
import pako from "pako";

export default function AadhaarQRReader() {
  const [decimalData, setDecimalData] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const DELIMITER = 255;

  // 🔹 Convert BigInt → Uint8Array
  const bigIntToBytes = (bigInt) => {
    const bytes = [];
    while (bigInt > 0n) {
      bytes.unshift(Number(bigInt & 0xffn));
      bigInt >>= 8n;
    }
    return new Uint8Array(bytes);
  };

  // 🔹 Read field till delimiter 255
  function readField(data, indexObj) {
    const start = indexObj.index;

    // stop at 255 or end of data
    while (indexObj.index < data.length && data[indexObj.index] !== 255) {
      indexObj.index++;
    }

    const fieldBytes = data.slice(start, indexObj.index);

    // skip delimiter if present
    if (indexObj.index < data.length && data[indexObj.index] === 255) {
      indexObj.index++;
    }

    return new TextDecoder("iso-8859-1").decode(fieldBytes);
  }

  const decodeQR = () => {
    try {
      setError(null);

      // 1️⃣ Clean decimal string
      const cleanDecimal = decimalData.replace(/\s+/g, "");
      const bigIntValue = BigInt(cleanDecimal);

      // 2️⃣ BigInt → Byte Array
      const byteArray = bigIntToBytes(bigIntValue);

      // 3️⃣ Decompress
      const decompressed = pako.inflate(byteArray);

      console.log("Decompressed Data:", decompressed);

      // 4️⃣ Parse fields
      const indexObj = { index: 0 };
      let firstField = readField(decompressed, indexObj);

      let emailMobileIndicator;
      let referenceId;

      // Check if first field is a UIDAI version marker
      if (/^V\d+$/i.test(firstField)) {
        // First field is version → ignore it
        emailMobileIndicator = readField(decompressed, indexObj);
        referenceId = readField(decompressed, indexObj); // always read after indicator
      } else {
        // No version → first field is email/mobile indicator
        emailMobileIndicator = firstField;

        // Now check if this QR is old Aadhaar (has referenceId)
        const nextField = readField(decompressed, indexObj);

        // UIDAI referenceId is numeric + last 4 digits of Aadhaar + timestamp (always longer)
        if (/^\d{17,}$/.test(nextField)) {
          referenceId = nextField; // old Aadhaar
        } else {
          // No referenceId, this is new Aadhaar
          referenceId = null;
          indexObj.index -= nextField.length + 1; // rollback: nextField is actually 'name'
        }
      }

      console.log("Reference ID:", referenceId);
      console.log("Email/Mobile Indicator:", emailMobileIndicator);

      // Personal details
      const name = readField(decompressed, indexObj);
      console.log(name);
      const dob = readField(decompressed, indexObj);
      const gender = readField(decompressed, indexObj);

      // Address fields
      const careOf = readField(decompressed, indexObj);
      const district = readField(decompressed, indexObj);
      const landmark = readField(decompressed, indexObj);
      const house = readField(decompressed, indexObj);
      const location = readField(decompressed, indexObj);
      const pin = readField(decompressed, indexObj);
      const postOffice = readField(decompressed, indexObj);
      const state = readField(decompressed, indexObj);
      const street = readField(decompressed, indexObj);
      const subDistrict = readField(decompressed, indexObj);
      const vtc = readField(decompressed, indexObj);

      const address = [
        careOf,
        house,
        street,
        location,
        landmark,
        postOffice,
        vtc,
        subDistrict,
        district,
        state,
        pin,
      ]
        .filter(Boolean)
        .join(", ");
      console.log(address, name, dob, gender, emailMobileIndicator, referenceId);

      setResult({
        name,
        dob,
        gender,
        address,
        emailMobileIndicator,
        referenceId,
      });
    } catch (err) {
      setError("Invalid or corrupted Aadhaar Secure QR data");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Aadhaar Secure QR Reader (Frontend)</h2>

      <textarea
        rows="16"
        placeholder="Paste Secure QR decimal data here"
        value={decimalData}
        onChange={(e) => setDecimalData(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <button
        onClick={decodeQR}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Decode QR
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Decoded Data</h3>
          <p>
            <b>Name:</b> {result.name}
          </p>
          <p>
            <b>DOB / YOB:</b> {result.dob}
          </p>
          <p>
            <b>Gender:</b> {result.gender}
          </p>
          <p>
            <b>Address:</b> {result.address}
          </p>
        </div>
      )}
    </div>
  );
}
