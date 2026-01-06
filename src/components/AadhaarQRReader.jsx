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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <div style={{
        maxWidth: 750,
        margin: "0 auto",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 30px",
          color: "white",
          textAlign: "center",
        }}>
          <h1 style={{
            margin: "0 0 10px 0",
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
          }}>
            🎫 Aadhaar QR Decoder
          </h1>
          <p style={{
            margin: "0",
            fontSize: "14px",
            opacity: 0.9,
          }}>
            Secure QR Code Decryption & Data Extraction
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "40px 30px" }}>
          {/* Info Box */}
          <div style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            padding: "15px 20px",
            borderRadius: "10px",
            color: "white",
            marginBottom: "25px",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            ℹ️ Paste the decimal representation of your Aadhaar Secure QR code below
          </div>

          {/* Textarea */}
          <textarea
            rows="14"
            placeholder="Paste Secure QR decimal data here..."
            value={decimalData}
            onChange={(e) => setDecimalData(e.target.value)}
            style={{
              width: "100%",
              padding: "15px 16px",
              borderRadius: "12px",
              border: "2px solid #e0e0e0",
              fontSize: "14px",
              fontFamily: "monospace",
              boxSizing: "border-box",
              resize: "vertical",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              backgroundColor: "#f8f9fa",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
            }}
          />

          {/* Button */}
          <button
            onClick={decodeQR}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
            }}
          >
            🔓 Decode QR
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: "20px",
              padding: "16px 20px",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              ❌ {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{
              marginTop: "30px",
              padding: "25px 20px",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              borderRadius: "15px",
              border: "2px solid #667eea",
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "22px",
                fontWeight: "700",
                color: "#667eea",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                ✅ Decoded Information
              </h3>

              {/* Result Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #667eea",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Name</p>
                  <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#667eea" }}>{result.name}</p>
                </div>

                <div style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #764ba2",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>DOB / YOB</p>
                  <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#764ba2" }}>{result.dob}</p>
                </div>

                <div style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #f5576c",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Gender</p>
                  <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#f5576c" }}>{result.gender}</p>
                </div>

                <div style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #ffa502",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Reference ID</p>
                  <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#ffa502" }}>{result.referenceId || "N/A"}</p>
                </div>
              </div>

              {/* Address */}
              <div style={{
                background: "white",
                padding: "15px",
                borderRadius: "10px",
                borderLeft: "4px solid #00d4ff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>📍 Address</p>
                <p style={{ margin: "0", fontSize: "15px", fontWeight: "500", color: "#333", lineHeight: "1.6" }}>{result.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
